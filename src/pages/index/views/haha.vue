<template>
    <div>
        <div @click="test">
            hahaha
        </div>
        <hahaCpn @click="test"/>
    </div>
</template>

<script>
import hahacpn from './hahacpn.vue'
    export default {
        name:'haha-view',
        components:[hahacpn],
        methods:{
            test(){
                console.log(123)
            }
        }
    }
</script>
