<template>
    <main>
      <h3
      @click="()=>{}"
      @ss="()=>{}"
      :data-ss="$route.meta.pageId"
      >bbbbbbb</h3>
      <h3
      @click="test($event)"
      >sssss</h3>
      <div class="testchild" @click="test($event)">
        <div>testchildbtn</div>
      </div>
      <hahacpn />
    </main>
</template>

<script>
  import hahacpn from '@/pages/index/views/hahacpn.vue';

    export default {
        components:{hahacpn},
        data(){
            return{
                ssss:'ss',
                key:['','asd']
            }
        },
        methods:{
            test (event){
                console.log(112233,event.target.dataset)
            }
        }
    }
</script>
    
