import { useEffect,useState } from 'react';
import { View,Text,Pressable,FlatList,StyleSheet,Alert } from 'react-native';
import { supabase } from '../src/supabase';
import { Order } from '../src/types';
import { router } from 'expo-router';

export default function Rider(){
 const [orders,setOrders]=useState<Order[]>([]);
 async function load(){const {data}=await supabase.from('orders').select('*').in('status',['pending','accepted','picked_up','on_the_way']).order('created_at',{ascending:false});setOrders((data||[]) as Order[]);}
 useEffect(()=>{load();const ch=supabase.channel('rider-orders').on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>load()).subscribe();return()=>{supabase.removeChannel(ch)}},[]);
 async function act(o:Order){const {data:u}=await supabase.auth.getUser();if(!u.user)return;
  if(o.status==='pending'){const {error}=await supabase.rpc('accept_order',{p_order_id:o.id});if(error)Alert.alert('Unavailable',error.message)}
  else {const next:any={accepted:'picked_up',picked_up:'on_the_way',on_the_way:'delivered'}[o.status];const {error}=await supabase.from('orders').update({status:next,rider_id:u.user.id}).eq('id',o.id).eq('rider_id',u.user.id);if(error)Alert.alert('Error',error.message)}
  load();
 }
 async function logout(){await supabase.auth.signOut();router.replace('/')}
 return <View style={s.page}><View style={s.row}><Text style={s.h1}>Rider</Text><Pressable onPress={logout}><Text style={s.link}>Logout</Text></Pressable></View><Text style={s.h2}>Live deliveries</Text>
 <FlatList data={orders} keyExtractor={x=>x.id} renderItem={({item})=><View style={s.card}><Text style={s.bold}>#{item.id.slice(0,8)} • ₱{item.total}</Text><Text>{item.restaurant_name}</Text><Text>{item.delivery_address}</Text><Text style={s.status}>{item.status.replace('_',' ').toUpperCase()}</Text><Pressable style={s.button} onPress={()=>act(item)}><Text style={s.bt}>{item.status==='pending'?'Accept delivery':item.status==='accepted'?'Mark picked up':item.status==='picked_up'?'Start delivery':'Mark delivered'}</Text></Pressable></View>} ListEmptyComponent={<Text style={s.muted}>No active deliveries.</Text>}/>
 </View>
}
const s=StyleSheet.create({page:{flex:1,padding:20,paddingTop:60,backgroundColor:'#f7f8fa'},row:{flexDirection:'row',justifyContent:'space-between'},h1:{fontSize:28,fontWeight:'800'},h2:{fontSize:18,fontWeight:'800',marginTop:22,marginBottom:10},card:{backgroundColor:'#fff',padding:15,borderRadius:14,marginBottom:10},bold:{fontWeight:'800'},status:{color:'#e53935',fontWeight:'800',marginTop:7},button:{backgroundColor:'#e53935',padding:12,borderRadius:10,alignItems:'center',marginTop:12},bt:{color:'#fff',fontWeight:'800'},link:{color:'#e53935',fontWeight:'700'},muted:{color:'#6c7680'}});
