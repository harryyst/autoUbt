<template>
    <div class="about">
      <h1 @click="test($event)" data-ubtid="asddsa">This is an about page</h1>
      <van-ss @click="test($event)" data-ubtKey="testcpn"></van-ss>
    </div>
</template>

<script>
    export default {
        test(event){
        console.log(11111,event)
    } 
    }
</script>
