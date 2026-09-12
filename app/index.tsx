import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../src/supabase';

export default function Index() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [name,setName]=useState('');
  const [rider,setRider]=useState(false);
  const [signup,setSignup]=useState(false);
  const [busy,setBusy]=useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (signup) {
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,role:rider?'rider':'customer'}}});
        if(error) throw error;
        if(data.user) Alert.alert('Account created','Check your email if confirmation is enabled, then log in.');
      } else {
        const {error}=await supabase.auth.signInWithPassword({email,password});
        if(error) throw error;
        const {data:userData}=await supabase.auth.getUser();
        const role=userData.user?.user_metadata?.role || 'customer';
        router.replace(role==='rider'?'/rider':'/customer');
      }
    } catch(e:any) { Alert.alert('Error',e.message); }
    finally { setBusy(false); }
  }

  return <View style={s.page}>
    <Text style={s.logo}>Tubigon Express</Text>
    <Text style={s.sub}>Fast local food delivery</Text>
    {signup && <TextInput style={s.input} placeholder="Full name" value={name} onChangeText={setName}/>}
    <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/>
    <TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
    {signup && <Pressable onPress={()=>setRider(!rider)} style={s.check}><Text>{rider?'✓':'□'} Create a rider account</Text></Pressable>}
    <Pressable disabled={busy} style={s.button} onPress={submit}><Text style={s.buttonText}>{busy?'Please wait...':signup?'Create account':'Log in'}</Text></Pressable>
    <Pressable onPress={()=>setSignup(!signup)}><Text style={s.link}>{signup?'Already have an account? Log in':'New here? Create an account'}</Text></Pressable>
  </View>
}
const s=StyleSheet.create({page:{flex:1,justifyContent:'center',padding:24,backgroundColor:'#f7f8fa'},logo:{fontSize:32,fontWeight:'800',color:'#e53935'},sub:{color:'#66717b',marginBottom:28},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ddd',padding:14,borderRadius:12,marginBottom:12},button:{backgroundColor:'#e53935',padding:15,borderRadius:12,alignItems:'center',marginTop:5},buttonText:{color:'#fff',fontWeight:'800'},link:{textAlign:'center',marginTop:18,color:'#e53935'},check:{marginBottom:12}});
