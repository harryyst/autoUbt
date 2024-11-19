// my-custom-loader.js
const fs = require('fs');
const parser = require('@babel/parser');
const path=require('path')
const traverse = require('@babel/traverse').default;
// const { getOptions } = require('loader-utils');
const compiler = require('vue-template-compiler');
const { LocalStorage } = require('node-localstorage');
const mockUbtConfig = require('./mockUbtConfig')

let pathRouteMap = new Map()
let routers = []
let allRouters = []
let clickContentList = []
let clickList

function replacer(key, value) {
    if(value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  }
  
  function reviver(key, value) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }


// const {routers,allRouters,pathRouteMap,fileid,clickContentList} = require('./loaderVar')
// let routers=[]
// let allRouters = []
// const pathRouteMap = new Map()
// let fileid = ''
// let clickContentList = []

// let pathRouteMap
// let routers
// let fileid 
// let allRouters
// let clickContentList

function getUbtConfig(){
    routers = mockUbtConfig
    // routers = []
}

function compareConfig(){
    // routers = routers.filter((item)=>{
    //     const existItem = allRouters.find(item1=>item1.pageId===item.pageId)
    //     if(existItem){
    //         return true
    //     }
    // })
  }

function getRouteConfig(nodeProper,route){
    if(!nodeProper)return
    nodeProper.forEach(proper=>{
        if(proper.type==='ObjectProperty'){
            // console.log(112233,proper.key.name)
            if(proper.key.name==='meta'){
                getRouteConfig(proper.value.properties,route)
            }
            if(proper.value.name||proper.value.value){
                route[proper.key.name]=proper.value.name||proper.value.value
            }
        }
    })
    return route
}

function addRoute(){
    rawRouteList.forEach(route=>{
        if(!route.pageId)return
        const existRoute = routers.find(item=>item.pageId===route.pageId)
        if(!existRoute){
            routers.push({
                pageId:route.pageId,
                pageContent:route.name,
                title:route.title,
                children:[],
                cpns:[]
            })
        }
        allRouters.push({
            pageId:route.pageId,
            pageContent:route.name,
            title:route.title,
            children:[],
            cpns:[]
        })
    })
    
  }

const rawRouteList = []
async function readRoute(filePath){
    const filecontent = await fs.promises.readFile(filePath,'utf-8')
    // 使用Babel解析器解析JavaScript代码并生成AST
    const ast = parser.parse(filecontent, {
        sourceType: 'module', // 或者 'script'，取决于你的文件是模块还是脚本
        plugins: ['jsx'] // 如果你的代码中包含JSX，确保启用了该插件
    });
    
    // 使用Babel的traverse工具来遍历AST
    traverse(ast, {
    ImportDeclaration(path) {
      // 获取导入的值
      const importValue = path.node.source.value;
      const importModule = importValue.split('/views/')[1];
      // 获取导入的变量名
      const specifiers = path.node.specifiers;
      const importedVariables = specifiers.map(specifier => {
        if (specifier.type === 'ImportSpecifier') {
          // 如果是具名导入
          return specifier.imported.name;
        } else if (specifier.type === 'ImportDefaultSpecifier') {
          // 如果是默认导入
          return specifier.local.name;
        } 
      });
      if(importModule&&importedVariables){
        pathRouteMap.set(importModule,importedVariables[0]);
      }
    },
    ArrowFunctionExpression(path) {
        if (path.parent.type === 'VariableDeclarator' && path.parentPath.parent.type === 'VariableDeclaration') {
          const variableName = path.parent.id.name;
          const dynamicImportNode = path.node.body;
          // 检查箭头函数的返回值是否是动态导入
          if (dynamicImportNode.type === 'CallExpression') {
            const importValue = dynamicImportNode.arguments[0].value;
            const importModule = importValue.split('/views/')[1];

            pathRouteMap.set(importModule,variableName);
        }
        }
      },
      ArrayExpression(path) {
        // console.log(1122333,path.parentPath)
        // if(path.parentPath.node?.key?.name==='routes'||path.parentPath.node?.id?.name==='routes'){
            path.node.elements.forEach(node=>{
                const route1 = {}
                getRouteConfig(node.properties,route1)
                rawRouteList.push(route1)
            })
            addRoute(rawRouteList)
        // }
      }
  });
  }
  

async function readFiles(dir) {
    // read directory
    const fileNames = await fs.readdirSync(dir) 

      for(const filename of fileNames){
        // get current file name
        const name = path.parse(filename).name;
        // get current file extension
        const ext = path.parse(filename).ext;
        // get current file path
        const filepath = path.resolve(dir, filename);
  
        // get information about the file
        const stat= await fs.statSync(filepath)
          // check if the current path is a file or a folder
          const isFile = stat.isFile();
  
          // exclude folders
          if (isFile) {
            // console.log(filepath)
            // callback, do something with the file
            await readRoute(filepath);
          }
    }
  }
  function normalizeCpnName(name){
    const lowerName = name.toLowerCase();
    const processedName = lowerName.replace(/[^a-z0-9]/g, '');
    return processedName
  }

  function getRoute(){
    // const pageName = file.split('/views/')[1];
    let result =''
    let cpnname=''
    if(fileid.endsWith('.vue')) {
        const filename = fileid.split('/views/')[1];
        result = pathRouteMap.get(filename)
        cpnname = fileid.substring(fileid.lastIndexOf('/') + 1);
    }else{
        console.log("无法截取指定部分",fileid);
    }

    if(result){
        const routes = routers.filter((item)=>{
            return item.pageContent==result
        })
        if(routes){ // 如果是本页面直接返回
            return routes
        }
    } else{
         // 如果是组件
            const cpnRoutes = []
            for(const route of routers){
                const cpn = route.cpns.find(item=>item===cpnname) 
                if(cpn){
                    if(!cpnRoutes.includes(route)){
                        cpnRoutes.push(route)
                    }
                }
            }
            return cpnRoutes
    }
    // 找到使用该组件的所有路由的list
  }

  function addCpnToRoutes(cpn){
    // const processedtagName = normalizeCpnName(tagName)
    const routes = getRoute()
    if(routes){
        for(const route of routes){
            console.log(22222,route.cpns)
            if(!route.cpns.includes(cpn.source)){
                route.cpns.push(cpn.source)
            }
        }
    }
    // console.log(112233,routes)
    // cpns
  }


  function traverseAst(ast,imports){
    if (ast && ast.children) {
        for (const child of ast.children) {
            if(child.type===1){
                const ss =new Map()
                if(child.attrsMap['@click']){
                    clickList.push({attrsMap:child.attrsMap,children:child.children,tag:child.tag})
                    console.log(888,child)
                }
                const cpn = imports.find(item1=>normalizeCpnName(child.tag)===normalizeCpnName(item1.name))
                if(cpn){
                    addCpnToRoutes(cpn)
                }
            }else{
                traverseAst(child,imports)
            }
        }
    }
  }

  async function visitAst(tempalteCode,scriptCode){
    const imports = [];
        // const {ast} = await compileScript({source: code,filename:fileid,isTS:true,scriptSetup:true},{id:fileid})
        // console.log(223344,fileid)
        const ast = parser.parse(scriptCode, {
            sourceType: 'module',
            plugins: ['jsx'],
          });
          traverse(ast, {
            ImportDeclaration(path) {
              const importNode = path.node;
              const importSource = importNode.source.value;
              const importSpecifiers = importNode.specifiers.map(specifier => {
                if (specifier.imported) {
                  return specifier.imported.name;
                }
                return specifier.local.name;
              });
              imports.push({name:importSpecifiers[0],source:importSource.substring(importSource.lastIndexOf('/') + 1)})
            }
          });
        //   console.log(112233,imports)
        const { ast:templateAst } = compiler.compile(tempalteCode);
        // console.log(templateAst)
        traverseAst(templateAst,imports)
  }

  function getInfoFromUbt(ubtstring){
    const regex = /%%(.*?)%%/;
    const match = ubtstring.match(regex)
    const ubtid = ubtstring.substring(ubtstring.lastIndexOf('_') + 1, match.index)

    const ubtcontent = match[1]; // Content between %%

    const lastIndex = ubtstring.lastIndexOf('%%');
    const ubtkey = ubtstring.substring(lastIndex + 2)||'';

    return{
        ubtid,
        ubtcontent,
        ubtkey
    }
  }

  function addClickUbtToList(routes,content,ubtidValue='',ubtkeyValue){
    routes.forEach(route=>{
        const ubtInfo = `${route.pageId}_${ubtidValue}%%${content}%%${ubtkeyValue}`
        // const number = route.children.filter(item => item.startsWith(ubtInfo)).length
        if(route.children.length===0){
                route.children.push(`${ubtInfo}`)
        }else{
            const findItem = route.children.find((item)=>{
                const {ubtcontent,ubtkey}=getInfoFromUbt(item)
                if(ubtcontent===content&&ubtkey==ubtkeyValue){
                    return true
                }
            })
            if(!findItem){
                if(!route.children.includes(`${ubtInfo}`)){
                    route.children.push(`${ubtInfo}`)
                }
            }

        }
    })
  }

  function findLastTag(text) {
    // 构建正则表达式
    let regex = /<([^>]+)>/g;

    // 使用正则表达式匹配所有标签
    let matches = text.match(regex);

    // 如果找到匹配项，返回最后一个匹配的标签
    if (matches && matches.length > 0) {
        return matches[matches.length - 1];
    } else {
        return null;
    }
}

  function addDataUbtidToClickElements(templateContent) {

    const clickElementsRegex =/<\w+\s[^>]*@click[^>]*>/g;
    // const clickElementsRegex = /<[^>]*@click\s*=[^>]*>(?![^>]*\/>)[\s\S]*?<\/[^>]*>/g;
    const clickElements = templateContent.match(clickElementsRegex);
    const routes = getRoute()
    console.log(3399,clickElements)
    let clicktag
    if(clickList&&routes){
        clickList.forEach((node)=>{
            let content 
            if(node.children[0]&&node.children[0].text){ //<van-ss></van-ss> 未完善
                rawContent = node.children[0].text
                const result = templateContent.split(rawContent)[0]
                clicktag = findLastTag(result)
                content = rawContent.replace(/\n/g, '').replace(/\r/g, '').replace(/\s/g, '');
            }else if(clickElements){
                content = node.attrsMap['data-ubtKey']||''
                clicktag = clickElements.find(element=>{
                    return element.indexOf(node.tag)!==-1 && element.indexOf(content)!==-1
                })
                if(!clicktag) return 
            }else{
                return
            }
            clickContentList.push(content)
            const ubtidValue = node.attrsMap['data-ubtid']||''
            const ubtkeyValue = node.attrsMap['data-ubtKey']||''
            console.log(`ubtidValue: ${ubtidValue}`);
            addClickUbtToList(routes,content,ubtidValue,ubtkeyValue)
            const elementId= getElementId(routes,content,ubtkeyValue)
            const pageid = "${$route.meta.pageId}"
            const modifiedElement = clicktag.replace(
                /<([\w-]+)(\s*[^>]*)>/,
                (match, tagName, attributes) => {
                    return `<${tagName} :data-id="\`${pageid}_${elementId}\`" ${attributes}>`;
                }
            );
            // console.log(776655,modifiedElement)
            templateContent = templateContent.replace(clicktag, modifiedElement);
        })
    }

    // if (clickElements &&routes) {
    //   // 遍历匹配到的标签，为其添加 data-ubtid 属性
    //   clickElements.forEach((element) => {
    //     const contentMatch = element.match(/>([^<>]*)(?:(?![^<>]*=>)[^<>]*)</);
    //     const content = contentMatch ? contentMatch[1].trim() : '';
    //     const ubtidMatch = element.match(/data-ubtid\s*=\s*["']([^"']*)["']/);
    //     const ubtidValue = ubtidMatch ? ubtidMatch[1] : '';
    //     const ubtkeyMatch = element.match(/ubtKey\s*=\s*["']([^"']*)["']/);
    //     const ubtkeyValue = ubtkeyMatch ? ubtkeyMatch[1] : '';
    //     console.log(`ubtidValue: ${ubtidValue}`);
    //     // 输出内容
    //     console.log(`@click element content: ${content}`);
    //     clickContentList.push(content)
    //     addClickUbtToList(routes,content,ubtidValue,ubtkeyValue)
    //     const elementId= getElementId(routes,content,ubtkeyValue)
    //     const pageid = "${$route.meta.pageId}"
        // const modifiedElement = element.replace(
        //     /<([\w-]+)(\s*[^>]*)>/,
        //     (match, tagName, attributes) => {
        //         return `<${tagName} :data-id="\`${pageid}_${elementId}\`" ${attributes}>`;
        //     }
        // );
        // templateContent = templateContent.replace(element, modifiedElement);
    //   });
    // //   compareRouteChildrenAndContentList(routes,clickContentList)
    // }
    return templateContent;
  }

  function getElementId(routes,content,ubtkeyValue){
    if(routes){
        const result = routes?.[0]?.children.find(item=>{
            const {ubtcontent,ubtkey}= getInfoFromUbt(item)
            if(ubtcontent===content&&ubtkey===ubtkeyValue){
                return true
            }
        })
        if(result){
            const {ubtid}= getInfoFromUbt(result)
            return ubtid
        }
    }
    return ''
  }

function processVueFile(templateContent,scriptContent) {
    // 先遍历 tempalte 及 script ast树
    visitAst(templateContent,scriptContent)

    // 还需处理script中import
    // const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
    if (!templateContent) return
      const newTemplateContent = addDataUbtidToClickElements(templateContent);
    return newTemplateContent
    // return code;
  }


  function writeUbtCondig(){
    return fs.promises.writeFile('./ubtConfig.json',JSON.stringify(routers))
  }

const ubtLoader= async function(source) {
    let callback = this.async();
    // pathRouteMap = this.getOptions().pathRouteMap
    // routers = this.getOptions().routers
    // allRouters = this.getOptions().allRouters
    // clickContentList = this.getOptions().clickContentList
    // console.log(44556677, pathRouteMap)
    const localStorage = new LocalStorage('./scratch');
    pathRouteMap=localStorage.getItem('pathRouteMap')
    routers=localStorage.getItem('routers')
    allRouters=localStorage.getItem('allRouters')
    clickContentList=localStorage.getItem('clickContentList')
    clickList = []
    if(!pathRouteMap){
        routers=[]
        allRouters = []
        pathRouteMap = new Map()
        clickContentList = []
    }else{
        pathRouteMap = JSON.parse(pathRouteMap, reviver);
        allRouters=JSON.parse(allRouters)
        routers=JSON.parse(routers)
        clickContentList=JSON.parse(clickContentList)
    }

    if(pathRouteMap.size===0){
        // this._compilation.__myGlobalVariable++;
        getUbtConfig()
        await readFiles(path.resolve(__dirname,'./src/router'))
        compareConfig()
    }

    // 检查是否为Vue单文件组件
      fileid = this.resourcePath
      // 解析Vue文件
    //   if(this.resourceQuery)return callback(null,source)
      const { template, script,styles } = compiler.parseComponent(source);
      console.log(445566,styles,script)
        let styleTag = '<style>'
      if(styles?.[0]?.attrs){
        styleTag = `<style ${styles[0].attrs.scoped?'scoped':''} ${styles[0].attrs.lang? `lang="${styles[0].attrs.lang}"` :""}>`
      }
    //   return source;
    const modifyTemplateContent = processVueFile(template.content,script.content)
    const styleContent = styles.map(style => style.content).join('\n');
      writeUbtCondig()
      // 返回修改后的代码
      const result = `<template>${modifyTemplateContent ?modifyTemplateContent:template.content}</template>\n\n<script>${script ? script.content : ''}</script>\n${styleTag}${styleContent}</style>`;
      console.log(213,result)
    //   return result

      pathRouteMap = JSON.stringify(pathRouteMap, replacer);
      allRouters=JSON.stringify(allRouters)
      routers=JSON.stringify(routers)
      clickContentList=JSON.stringify(clickContentList)
      localStorage.setItem('pathRouteMap',pathRouteMap)
      localStorage.setItem('allRouters',allRouters)
      localStorage.setItem('routers',routers)
      localStorage.setItem('clickContentList',clickContentList)

      return callback(null,result)

    // 对于其他类型的文件，直接返回源代码
    // return source;
  };


module.exports = ubtLoader