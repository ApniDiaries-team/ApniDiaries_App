import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React,{useEffect,useMemo,useState} from 'react';
import { ActivityIndicator,Image,ImageBackground,Pressable,ScrollView,Text,TextInput,View } from 'react-native';
import api from '../api/axios';
import { Fonts,Palette } from '../constants/theme';
import { useDarkMode } from '../context/DarkModeContext';

const DATA={
  bikes:{url:'api/bike-rentals',title:'Rent Your Freedom',sub:'Premium motorcycles for unforgettable journeys across the most breathtaking terrains.',hero:'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1600',heading:'Curated Fleet',copy:'Maintained to perfection. Ready for your next adventure.',placeholder:'Where to?'},
  hostels:{url:'api/hostels',title:'A Home for Every Journey',sub:'Discover handpicked boutique hostels designed for comfort, community, and the modern traveler.',hero:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600',heading:'Handpicked Stays',copy:'Curated spaces for rest and connection.',placeholder:'Where to?'},
  packages:{url:'api/packages',title:'Escape to Extraordinary',sub:'Hand-picked experiences that prioritize connection, sustainability, and the soul of the destination.',hero:'https://images.unsplash.com/photo-1502786129293-79981df4e689?w=1600',heading:'Curated Journeys',copy:'Find the right trip for your next adventure.',placeholder:'Where to next?'}
};
const tabs=[['packages','Packages','compass'],['bikes','Bikes','wind'],['hostels','Hostels','home']];
const imageOf=x=>x?.thumbnail_url||x?.image_url||x?.cover_image||x?.photos?.[0]?.image_url||x?.images?.[0]?.image_url;
const titleOf=(x,type)=>x?.name||x?.title||(type==='bikes'?[x?.brand,x?.model].filter(Boolean).join(' '):'')||'Untitled';
const money=x=>Number(x)>0?'₹'+Number(x).toLocaleString('en-IN'):null;

export default function ServiceCatalog({type}){
 const router=useRouter(),{isDarkMode}=useDarkMode(),c=isDarkMode?Palette.dark:Palette.light,conf=DATA[type];
 const [items,setItems]=useState([]),[search,setSearch]=useState(''),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[showAll,setShowAll]=useState(false),[category,setCategory]=useState('All types');
 const load=async q=>{setLoading(true);setFailed(false);try{const r=await api.get(conf.url,{params:q?{search:q}:{}});setItems(Array.isArray(r?.data?.data)?r.data.data:[])}catch(e){setItems([]);setFailed(true)}finally{setLoading(false)}};
 useEffect(()=>{load('')},[type]);
 const shown=useMemo(()=>{const featured=items.filter(x=>x.is_featured||(type==='bikes'&&x.is_popular));let list=featured.length?[...featured,...items.filter(x=>!featured.includes(x))]:items;if(type==='bikes'&&category!=='All types')list=list.filter(x=>String(x.category||x.type||'').toLowerCase()===category.toLowerCase());return showAll||type==='packages'?list:list.slice(0,3)},[items,type,category,showAll]);
 const submit=()=>{setQuery(search.trim());load(search.trim())};
 return <View style={{flex:1,backgroundColor:c.surface}}>
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:112}}>
   <ImageBackground source={{uri:conf.hero}} resizeMode="cover" style={{height:type==='packages'?370:340,justifyContent:'center'}}>
    <LinearGradient colors={['rgba(12,13,17,0.18)','rgba(12,13,17,0.78)']} style={{position:'absolute',top:0,bottom:0,left:0,right:0}}/>
    <View style={{paddingHorizontal:22}}>
     {type==='packages'&&<Text style={{color:'#fff',fontFamily:Fonts.inter.semibold,fontSize:11,letterSpacing:2}}>ADVENTURE AWAITS</Text>}
     <Text style={{color:'#fff',fontFamily:Fonts.playfair.bold,fontSize:type==='packages'?38:34,lineHeight:type==='packages'?45:42,marginTop:8}}>{conf.title}</Text>
     <Text style={{color:'rgba(255,255,255,.88)',fontFamily:Fonts.inter.regular,fontSize:14,lineHeight:21,marginTop:12}}>{conf.sub}</Text>
     <View style={{marginTop:22,minHeight:54,borderRadius:18,paddingLeft:15,paddingRight:6,flexDirection:'row',alignItems:'center',backgroundColor:c.surfaceLowest,elevation:5}}>
      <Feather name="map-pin" size={17} color={c.outline}/>
      <TextInput value={search} onChangeText={setSearch} onSubmitEditing={submit} returnKeyType="search" placeholder={conf.placeholder} placeholderTextColor={c.outline} style={{flex:1,paddingHorizontal:10,color:c.text,fontFamily:Fonts.inter.regular,fontSize:14}}/>
      <Pressable onPress={submit} accessibilityLabel="Search" style={{width:44,height:44,borderRadius:15,backgroundColor:c.primary,alignItems:'center',justifyContent:'center'}}><Feather name="search" size={18} color={c.onPrimary}/></Pressable>
     </View>
    </View>
   </ImageBackground>
   {type==='packages'&&<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:20,paddingTop:18,gap:10}}>{tabs.map(([id,label,icon])=>{const active=id===type;return <Pressable key={id} onPress={()=>router.push('/'+(id==='bikes'?'bike-rentals':id))} style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:17,paddingVertical:11,borderRadius:99,backgroundColor:active?c.primary:c.surfaceLowest,borderWidth:active?0:1,borderColor:c.outlineVariant}}>{id==='bikes'?<MaterialCommunityIcons name="motorbike" size={17} color={active?c.onPrimary:c.text}/>:<Feather name={icon} size={15} color={active?c.onPrimary:c.text}/>}<Text style={{color:active?c.onPrimary:c.text,fontFamily:Fonts.inter.semibold,fontSize:13}}>{label}</Text></Pressable>})}</ScrollView>}
   <View style={{paddingHorizontal:20,paddingTop:type==='packages'?28:32}}>
    <Text style={{color:c.text,fontFamily:Fonts.playfair.bold,fontSize:27}}>{conf.heading}</Text>
    <Text style={{color:c.textVariant,fontFamily:Fonts.inter.regular,fontSize:14,lineHeight:21,marginTop:5}}>{conf.copy}</Text>
    {type==='bikes'?<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:18}}>{['All types','Adventure','Cruiser','Sport','Scooter'].map(x=><Pressable key={x} onPress={()=>setCategory(x)} style={{paddingHorizontal:13,paddingVertical:8,borderRadius:99,backgroundColor:category===x?c.primary:c.surfaceLowest,borderWidth:1,borderColor:category===x?c.primary:c.outlineVariant}}><Text style={{color:category===x?c.onPrimary:c.textVariant,fontFamily:Fonts.inter.medium,fontSize:12}}>{x}</Text></Pressable>)}</ScrollView>:<View style={{height:16}}/>}
    {loading?<View style={{paddingVertical:48,alignItems:'center'}}><ActivityIndicator size="large" color={c.primary}/><Text style={{color:c.textVariant,marginTop:12,fontFamily:Fonts.inter.medium}}>Finding your next stay...</Text></View>
    :failed?<View style={{padding:22,borderRadius:20,backgroundColor:c.surfaceLowest,alignItems:'center'}}><Feather name="wifi-off" size={22} color={c.outline}/><Text style={{marginTop:10,color:c.text,fontFamily:Fonts.inter.semibold}}>We could not load this collection.</Text><Pressable onPress={()=>load(query)} style={{marginTop:12,padding:10,backgroundColor:c.primary,borderRadius:12}}><Text style={{color:c.onPrimary,fontFamily:Fonts.inter.semibold}}>Try again</Text></Pressable></View>
    :!shown.length?<View style={{padding:24,borderRadius:20,backgroundColor:c.surfaceLowest,alignItems:'center'}}><Feather name="map" size={24} color={c.outline}/><Text style={{color:c.text,fontFamily:Fonts.playfair.bold,fontSize:19,marginTop:10}}>{query?'No matches found':type==='hostels'?'No hostels found':type==='bikes'?'No bikes listed yet':'No journeys listed yet'}</Text><Text style={{color:c.textVariant,fontFamily:Fonts.inter.regular,fontSize:13,marginTop:5,textAlign:'center'}}>Try another destination or check back soon.</Text></View>
    :<View style={{gap:18}}>{shown.map((x,i)=>{const photo=imageOf(x),name=titleOf(x,type),place=[x.city,x.state].filter(Boolean).join(', '),price=type==='bikes'?money(x.price_per_day):type==='hostels'?money(x.starting_price??x.price_per_night):money(x.price??x.starting_price??x.price_per_person),unit=type==='bikes'?'/day':type==='hostels'?'/night':'',desc=x.description||x.notes||x.tagline||x.summary||(type==='bikes'?[x.brand,x.model,x.category].filter(Boolean).join(' · '):place),featured=x.is_featured||(type==='bikes'&&x.is_popular),meta=type==='bikes'?[x.engine_cc&&x.engine_cc+'cc',x.weight_kg&&x.weight_kg+'kg'].filter(Boolean):type==='hostels'?(Array.isArray(x.amenities)?x.amenities.slice(0,2):[]):[x.duration||(x.duration_days&&x.duration_days+' days'),place].filter(Boolean);
     return <View key={String(x.id??i)} style={{overflow:'hidden',borderRadius:22,backgroundColor:c.surfaceLowest,borderWidth:1,borderColor:c.outlineVariant,elevation:isDarkMode?0:2}}>
      <View style={{height:190,backgroundColor:c.surfaceLow}}>{photo?<Image source={{uri:photo}} resizeMode="cover" style={{width:'100%',height:'100%'}}/>:<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>{type==='bikes'?<MaterialCommunityIcons name="motorbike" size={34} color={c.outline}/>:<Feather name={type==='hostels'?'home':'compass'} size={34} color={c.outline}/>}</View>}
       {featured&&<View style={{position:'absolute',top:13,left:13,paddingHorizontal:11,paddingVertical:6,borderRadius:99,backgroundColor:c.surfaceLowest}}><Text style={{color:c.primary,fontFamily:Fonts.inter.semibold,fontSize:10}}>POPULAR</Text></View>}
       {!!x.rating&&<View style={{position:'absolute',top:13,right:13,flexDirection:'row',gap:4,alignItems:'center',borderRadius:99,paddingHorizontal:10,paddingVertical:6,backgroundColor:c.surfaceLowest}}><Feather name="star" size={12} color={c.primary}/><Text style={{color:c.text,fontFamily:Fonts.inter.semibold,fontSize:11}}>{Number(x.rating).toFixed(1)}</Text></View>}
      </View>
      <View style={{padding:17}}>{!!place&&type!=='bikes'&&<Text style={{color:c.primary,fontFamily:Fonts.inter.semibold,fontSize:11,marginBottom:5}}>{place.toUpperCase()}</Text>}
       <Text style={{color:c.text,fontFamily:Fonts.playfair.semibold,fontSize:21}}>{name}</Text>
       {!!desc&&<Text numberOfLines={2} style={{color:c.textVariant,fontFamily:Fonts.inter.regular,fontSize:13,lineHeight:19,marginTop:5}}>{desc}</Text>}
       {!!meta.length&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:12}}>{meta.map((v,j)=><Text key={String(j)} style={{color:c.textVariant,backgroundColor:c.surfaceLow,borderRadius:99,paddingHorizontal:10,paddingVertical:6,fontFamily:Fonts.inter.medium,fontSize:11}}>{String(v)}</Text>)}</View>}
       {(price||type==='packages')&&<View style={{marginTop:15,paddingTop:13,borderTopWidth:1,borderTopColor:c.outlineVariant,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><View><Text style={{color:c.outline,fontFamily:Fonts.inter.medium,fontSize:10,textTransform:'uppercase'}}>{type==='packages'?'Starting at':'From'}</Text><Text style={{color:c.text,fontFamily:Fonts.inter.bold,fontSize:18,marginTop:2}}>{price||'Explore this journey'}{price&&<Text style={{color:c.textVariant,fontFamily:Fonts.inter.regular,fontSize:12}}>{unit}</Text>}</Text></View><View style={{width:38,height:38,borderRadius:14,backgroundColor:c.primary,alignItems:'center',justifyContent:'center'}}><Feather name="arrow-right" size={17} color={c.onPrimary}/></View></View>}
      </View>
     </View>})}</View>}
    {!loading&&!failed&&items.length>3&&type!=='packages'&&<Pressable onPress={()=>setShowAll(!showAll)} style={{alignSelf:'center',flexDirection:'row',alignItems:'center',gap:8,marginTop:22,padding:12}}><Text style={{color:c.primary,fontFamily:Fonts.inter.semibold}}>{showAll?'Show less':type==='bikes'?'View full fleet':'View all stays'}</Text><Feather name={showAll?'arrow-up':'arrow-right'} size={15} color={c.primary}/></Pressable>}
   </View>
  </ScrollView>
 </View>
}
