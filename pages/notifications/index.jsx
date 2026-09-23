import React,{useMemo,useState} from 'react';
import {ActivityIndicator,Pressable,ScrollView,Text,View} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useDarkMode} from '../../context/DarkModeContext';
import {useNotifications} from '../../context/NotificationContext';
import {Fonts,Palette} from '../../constants/theme';
import {markAllRead as apiMarkAllRead} from '../../services/notification.api';
import {acceptFriend,declineFriend} from '../../services/user.api';
import EmptyNotifications from './components/EmptyNotifications';
import NotificationCard from './components/NotificationCard';
import NotificationFilter from './components/NotificationFilter';
const sameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
const groupDates=list=>{const today=new Date(),yesterday=new Date(Date.now()-86400000),groups={Today:[],Yesterday:[],Earlier:[]};list.forEach(n=>{const d=n.timestamp?new Date(n.timestamp):null;if(d&&sameDay(d,today))groups.Today.push(n);else if(d&&sameDay(d,yesterday))groups.Yesterday.push(n);else groups.Earlier.push(n)});return Object.entries(groups).filter(([,items])=>items.length)};
export default function Notifications(){
 const router=useRouter(),{isDarkMode}=useDarkMode(),c=isDarkMode?Palette.dark:Palette.light;
 const {notifications,unreadCount,markAllRead,markOneRead,respondToFriendRequest,isLoading}=useNotifications();
 const [activeFilter,setActiveFilter]=useState('all');
 const filtered=useMemo(()=>notifications.filter(n=>activeFilter==='all'||(activeFilter==='message'?n.type==='message':activeFilter==='invites'?n.type==='friend_request':!['message','friend_request'].includes(n.type))),[notifications,activeFilter]);
 const groups=useMemo(()=>groupDates(filtered),[filtered]);
 const markAll=async()=>{try{await apiMarkAllRead();markAllRead()}catch(e){console.log('mark all read error',e)}};
 const respond=async(n,yes)=>{try{const r=yes?await acceptFriend(n.friendRequestId):await declineFriend(n.friendRequestId);if(r?.data?.success)respondToFriendRequest(n.id,yes)}catch(e){console.log('friend request error',e)}};
 return <View style={{flex:1,backgroundColor:c.surface}}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:20,paddingTop:24,paddingBottom:124}}>
  <View style={{marginBottom:21}}><Text style={{color:c.text,fontFamily:Fonts.playfair.bold,fontSize:31}}>Inbox</Text><Text style={{color:c.textVariant,fontFamily:Fonts.inter.regular,fontSize:14,marginTop:4}}>Stay up to date with your community.</Text></View>
  <NotificationFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={{all:notifications.filter(n=>!n.isRead).length,message:notifications.filter(n=>n.type==='message'&&!n.isRead).length,invites:notifications.filter(n=>n.type==='friend_request'&&!n.isResponded).length,alerts:notifications.filter(n=>!['message','friend_request'].includes(n.type)&&!n.isRead).length}}/>
  <View style={{marginTop:17,marginBottom:21,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}>
   <Pressable onPress={()=>router.push('/settings')} style={{flexDirection:'row',alignItems:'center',gap:7,paddingVertical:8}}><Feather name="settings" size={16} color={c.textVariant}/><Text style={{color:c.textVariant,fontFamily:Fonts.inter.medium,fontSize:12}}>Notification settings</Text></Pressable>
   {unreadCount>0&&<Pressable onPress={markAll} style={{flexDirection:'row',alignItems:'center',gap:6,padding:9,borderRadius:12,backgroundColor:c.surfaceLow}}><Feather name="check-circle" size={15} color={c.primary}/><Text style={{color:c.primary,fontFamily:Fonts.inter.semibold,fontSize:12}}>Mark all read</Text></Pressable>}
  </View>
  {isLoading?<View style={{alignItems:'center',paddingVertical:54}}><ActivityIndicator size="large" color={c.primary}/></View>:!filtered.length?<View style={{borderRadius:22,borderWidth:1,borderColor:c.outlineVariant,backgroundColor:c.surfaceLowest}}><EmptyNotifications filterType={activeFilter}/></View>:<View style={{gap:21}}>{groups.map(([label,items])=><View key={label}><Text style={{color:c.textVariant,fontFamily:Fonts.inter.semibold,fontSize:12,letterSpacing:.7,marginBottom:10}}>{label.toUpperCase()}</Text><View style={{gap:10}}>{items.map(n=><NotificationCard key={n.id} notification={n} onAccept={()=>respond(n,true)} onDecline={()=>respond(n,false)} onMarkAsRead={markOneRead}/>)}</View></View>)}</View>}
 </ScrollView></View>;
}
