
const msg=document.getElementById('msg');

async function send(url){
 const username=document.getElementById('username').value.trim();
 const password=document.getElementById('password').value.trim();

 const res=await fetch(url,{
   method:'POST',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({username,password})
 });

 const data=await res.json();

 if(url.includes('register')){
   msg.textContent=data.message || 'Registered';
   return;
 }

 if(data.token){
   localStorage.setItem('token',data.token);
   location.href='dashboard.html';
 }else{
   msg.textContent=data.message || 'Error';
 }
}

document.getElementById('registerBtn')?.addEventListener('click',()=>send('/api/register'));
document.getElementById('loginBtn')?.addEventListener('click',()=>send('/api/login'));

document.getElementById('logoutBtn')?.addEventListener('click',()=>{
 localStorage.removeItem('token');
 location.href='index.html';
});
