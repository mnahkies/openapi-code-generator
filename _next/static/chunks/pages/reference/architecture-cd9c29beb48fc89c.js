(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[939],{2606:function(e,i,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/reference/architecture",function(){return t(3404)}])},3404:function(e,i,t){"use strict";t.r(i),t.d(i,{default:function(){return o},useTOC:function(){return d}});var s=t(2322),r=t(4974),n=t(7903),a=t(6345),l={src:"/_next/static/media/architecture_high_level.cad5cd5e.svg",height:220,width:820,blurWidth:0,blurHeight:0},h={src:"/_next/static/media/architecture_core.8e78e256.svg",height:540,width:860,blurWidth:0,blurHeight:0},c={src:"/_next/static/media/architecture_templates.2823b3b6.svg",height:640,width:860,blurWidth:0,blurHeight:0};function d(e){let i={code:"code",...(0,a.a)()};return[{value:"Core",id:"core",depth:2},{value:(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(i.code,{children:"./loaders"})}),id:"loaders",depth:3},{value:(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(i.code,{children:"openapi-validator"})}),id:"openapi-validator",depth:3},{value:(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(i.code,{children:"openapi-loader"})}),id:"openapi-loader",depth:3},{value:(0,s.jsx)(s.Fragment,{children:(0,s.jsx)(i.code,{children:"input"})}),id:"input",depth:3},{value:"Templates",id:"templates",depth:2}]}var o=(0,r.c)(function(e){let{toc:i=d(e)}=e,t={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...(0,a.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.h1,{children:"Architecture"}),"\n",(0,s.jsx)(t.p,{children:"The project is still evolving, but this should give a good overview\nof the current codebase structure."}),"\n",(0,s.jsx)(t.p,{children:"Broadly speaking we have the “core” part of the library that should be re-usable\nacross all templates / target languages, and then the template functions."}),"\n",(0,s.jsx)(t.p,{children:"Some templates also make use of a runtime library."}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"high level architecture",src:l})}),"\n",(0,s.jsx)(t.h2,{id:i[0].id,children:i[0].value}),"\n",(0,s.jsxs)(t.p,{children:["This directory ",(0,s.jsx)(t.a,{href:"https://github.com/mnahkies/openapi-code-generator/tree/main/packages/openapi-code-generator/src/core",children:(0,s.jsx)(t.code,{children:"./src/core"})})," contains the generator/target language agnostic parts of the project."]}),"\n",(0,s.jsx)(t.p,{children:"The process of generation resembles a pipeline."}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"core architecture",src:h})}),"\n",(0,s.jsx)(t.h3,{id:i[1].id,children:i[1].value}),"\n",(0,s.jsxs)(t.p,{children:["Loaders are responsible for fetching a supported input format, and converting\nit to openapi3 if required, to be handed off to the ",(0,s.jsx)(t.code,{children:"openapi-validator"})," / ",(0,s.jsx)(t.code,{children:"openapi-loader"}),"."]}),"\n",(0,s.jsx)(t.p,{children:"Two loaders are supported:"}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"generic"})," which loads openapi3 specs in JSON/YAML formats"]}),"\n",(0,s.jsxs)(t.li,{children:[(0,s.jsx)(t.code,{children:"typespec"})," which loads typespec specs and converts them in-memory to openapi3"]}),"\n"]}),"\n",(0,s.jsx)(t.h3,{id:i[2].id,children:i[2].value}),"\n",(0,s.jsx)(t.p,{children:"Nothing particularly interesting here, just takes a loaded document and validates\nit against the OpenAPI 3 specification in JSON schema format."}),"\n",(0,s.jsx)(t.p,{children:"Useful for detecting errors due to bad input rather than bugs in the\ncode generation."}),"\n",(0,s.jsxs)(t.p,{children:["Due to a ",(0,s.jsx)(t.a,{href:"https://github.com/mnahkies/openapi-code-generator/issues/103",children:"bug"})," in ",(0,s.jsx)(t.code,{children:"ajv"}),"\nvalidation is currently skipped for OpenAPI 3.1 documents."]}),"\n",(0,s.jsx)(t.h3,{id:i[3].id,children:i[3].value}),"\n",(0,s.jsxs)(t.p,{children:[(0,s.jsx)(t.code,{children:"openapi-loader"})," takes an entry point path, and loads + validates a collection\nof files (",(0,s.jsx)(t.code,{children:"$ref"})," to other files supported)."]}),"\n",(0,s.jsx)(t.p,{children:"It then provides typed access to the raw OpenAPI structures, with methods able\nto convert “maybe refs” into the referenced objects."}),"\n",(0,s.jsxs)(t.p,{children:["This is important because one of the more painful (and bug prone) parts of\nparsing OpenAPI documents is correctly following ",(0,s.jsx)(t.code,{children:"$ref"}),"’s, as you need to carry\naround the context of which document you came from."]}),"\n",(0,s.jsxs)(t.p,{children:["The ",(0,s.jsx)(t.code,{children:"openapi-loader"})," makes this much less complicated by loading all files up front, and normalizing\nthe contained ",(0,s.jsx)(t.code,{children:"$ref"}),"s to absolute paths."]}),"\n",(0,s.jsx)(t.h3,{id:i[4].id,children:i[4].value}),"\n",(0,s.jsxs)(t.p,{children:["Ultimately an instance of the ",(0,s.jsx)(t.code,{children:"input"})," class is passed to a generator."]}),"\n",(0,s.jsxs)(t.p,{children:["The goal of the ",(0,s.jsx)(t.code,{children:"input"})," class is to provide ergonomic, target language agnostic access to\nthe OpenAPI documents given as input to the generator."]}),"\n",(0,s.jsx)(t.p,{children:"It primarily surfaces API operations, with optional grouping strategies, as a normalized type\nthat has already de-referenced parameters / responses, and set default values on various properties."}),"\n",(0,s.jsx)(t.h2,{id:i[5].id,children:i[5].value}),"\n",(0,s.jsxs)(t.p,{children:["Currently only ",(0,s.jsx)(t.code,{children:"typescript"})," templates are implemented, living in ",(0,s.jsx)(t.a,{href:"https://github.com/mnahkies/openapi-code-generator/tree/main/packages/openapi-code-generator/src/typescript",children:"./src/typescript"}),"."]}),"\n",(0,s.jsx)(t.p,{children:(0,s.jsx)(t.img,{alt:"templates architecture",src:c})}),"\n",(0,s.jsxs)(t.p,{children:["Each template currently has a simple signature:\n(from ",(0,s.jsx)(t.a,{href:"https://github.com/mnahkies/openapi-code-generator/tree/main/packages/openapi-code-generator/src/templates.types.ts",children:"./src/templates.types.ts"}),")"]}),"\n",(0,s.jsx)(t.pre,{tabIndex:"0","data-language":"typescript","data-word-wrap":"",children:(0,s.jsxs)(t.code,{children:[(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OpenapiGeneratorConfig"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"  dest"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" string"})]}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"  input"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Input"})]}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"  schemaBuilder"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" SchemaBuilderType"})]}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"  enableRuntimeResponseValidation"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" boolean"})]}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"  compilerOptions"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" CompilerOptions"})]}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"  allowUnusedImports"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" boolean"})]}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"  groupingStrategy"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OperationGroupStrategy"})]}),"\n",(0,s.jsx)(t.span,{children:(0,s.jsx)(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),"\n",(0,s.jsx)(t.span,{children:" "}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" interface"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OpenapiGenerator"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),"\n",(0,s.jsxs)(t.span,{children:[(0,s.jsx)(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ("}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"args"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" OpenapiGeneratorConfig"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Promise"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"void"}),(0,s.jsx)(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),"\n",(0,s.jsx)(t.span,{children:(0,s.jsx)(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})}),"\n",(0,s.jsxs)(t.p,{children:["Where ",(0,s.jsx)(t.code,{children:"dest"})," is a path to a directory to emit code into, and ",(0,s.jsx)(t.code,{children:"input"})," is an initialized instance\nof the ",(0,s.jsx)(t.code,{children:"Input"})," class described above. ",(0,s.jsx)(t.code,{children:"schemaBuilder"})," refers to ",(0,s.jsx)(t.code,{children:"zod | joi"})]}),"\n",(0,s.jsxs)(t.p,{children:["You can find all registered generators in ",(0,s.jsx)(t.a,{href:"https://github.com/mnahkies/openapi-code-generator/tree/main/packages/openapi-code-generator/src/templates.ts",children:"./src/templates.ts"})," - eventually this likely be split into\npackages that consume the core modules, or some other more pluggable system."]})]})},"/reference/architecture",{filePath:"src/pages/reference/architecture.mdx",timestamp:1714908438e3,pageMap:n.v,frontMatter:{},title:"Architecture"},"undefined"==typeof RemoteContent?d:RemoteContent.useTOC)},7903:function(e,i,t){"use strict";t.d(i,{v:function(){return s}});let s=[{data:{overview:"Overview","getting-started":"Getting Started",guides:"Guides",reference:"Reference",404:{display:"hidden",title:" "},index:{display:"hidden",title:" "}}},{name:"404",route:"/404",frontMatter:{sidebarTitle:"404"}},{name:"getting-started",route:"/getting-started",children:[{name:"quick-start",route:"/getting-started/quick-start",frontMatter:{sidebarTitle:"Quick Start"}}]},{name:"guides",route:"/guides",children:[{data:{concepts:"Concepts","client-templates":"Client Templates","server-templates":"Server Templates"}},{name:"client-templates",route:"/guides/client-templates",children:[{name:"typescript-angular",route:"/guides/client-templates/typescript-angular",frontMatter:{sidebarTitle:"TypeScript Angular"}},{name:"typescript-axios",route:"/guides/client-templates/typescript-axios",frontMatter:{sidebarTitle:"TypeScript Axios"}},{name:"typescript-fetch",route:"/guides/client-templates/typescript-fetch",frontMatter:{sidebarTitle:"TypeScript Fetch"}}]},{name:"concepts",route:"/guides/concepts",children:[{name:"extract-inline-schemas",route:"/guides/concepts/extract-inline-schemas",frontMatter:{sidebarTitle:"Extract Inline Schemas"}}]},{name:"server-templates",route:"/guides/server-templates",children:[{name:"typescript-koa",route:"/guides/server-templates/typescript-koa",frontMatter:{sidebarTitle:"TypeScript Koa"}}]}]},{name:"index",route:"/",frontMatter:{sidebarTitle:"Index"}},{name:"overview",route:"/overview",children:[{name:"about",route:"/overview/about",frontMatter:{sidebarTitle:"About"}},{name:"compatibility",route:"/overview/compatibility",frontMatter:{sidebarTitle:"Compatibility"}}]},{name:"reference",route:"/reference",children:[{name:"architecture",route:"/reference/architecture",frontMatter:{sidebarTitle:"Architecture"}},{name:"cli-options",route:"/reference/cli-options",frontMatter:{sidebarTitle:"CLI Options"}}]}]}},function(e){e.O(0,[974,888,774,179],function(){return e(e.s=2606)}),_N_E=e.O()}]);