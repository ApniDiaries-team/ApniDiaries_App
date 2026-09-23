import React from 'react';
import {Feather} from '@expo/vector-icons';
import {Pressable,ScrollView,Text,View} from 'react-native';
import {Fonts,Palette} from '../../../constants/theme';
import {useDarkMode} from '../../../context/DarkModeContext';
const filters=[['all','All','inbox'],['message','Messages','message-circle'],['invites','Invites','user-plus'],['alerts','Alerts','bell']];
export default function NotificationFilter({activeFilter,onFilterChange,counts}){
 const {isDarkMode}=useDarkMode(),c=isDarkMode?Palette.dark:Palette.light;
 return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:3}}>{filters.map(([id,label,icon])=>{const active=id===activeFilter,count=counts?.[id]||0;return <Pressable key={id} onPress={()=>onFilterChange(id)} style={{minHeight:42,flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:13,borderRadius:14,backgroundColor:active?c.primary:c.surfaceLowest,borderWidth:1,borderColor:active?c.primary:c.outlineVariant}}><Feather name={icon} size={15} color={active?c.onPrimary:c.textVariant}/><Text style={{color:active?c.onPrimary:c.textVariant,fontFamily:active?Fonts.inter.semibold:Fonts.inter.medium,fontSize:12}}>{label}</Text>{count>0&&<View style={{minWidth:18,height:18,borderRadius:9,paddingHorizontal:4,alignItems:'center',justifyContent:'center',backgroundColor:active?'rgba(255,255,255,.22)':c.surfaceLow}}><Text style={{color:active?c.onPrimary:c.primary,fontFamily:Fonts.inter.bold,fontSize:9}}>{count>99?'99+':count}</Text></View>}</Pressable>})}</ScrollView>
}
