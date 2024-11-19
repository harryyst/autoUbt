<template>
    <div>
        <div @click="cpnclick" data-ubtid="testid">
        {{ meme }}
        </div>
        <img @click="cpnclick"/>
        <div @click="cpnclick" data-ubtid="testid">
        {{ meme }}
        </div>
    </div>
    
</template>

<script>
    export default {
        name:'haha-cpn',
        data(){
            return{
                meme:'sddddssaaaaa'
            }
        },
        methods:{
            cpnclick(){
                console.log(112233)
            }
        }
    }
</script>