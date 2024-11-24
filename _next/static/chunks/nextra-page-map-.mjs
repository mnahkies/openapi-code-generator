import meta from "../../../src/pages/_meta.tsx";
import guides_meta from "../../../src/pages/guides/_meta.tsx";
export const pageMap = [{
  data: meta
}, {
  name: "404",
  route: "/404",
  frontMatter: {
    "sidebarTitle": "404"
  }
}, {
  name: "getting-started",
  route: "/getting-started",
  children: [{
    name: "quick-start",
    route: "/getting-started/quick-start",
    frontMatter: {
      "sidebarTitle": "Quick Start"
    }
  }]
}, {
  name: "guides",
  route: "/guides",
  children: [{
    data: guides_meta
  }, {
    name: "client-templates",
    route: "/guides/client-templates",
    children: [{
      name: "typescript-angular",
      route: "/guides/client-templates/typescript-angular",
      frontMatter: {
        "sidebarTitle": "TypeScript Angular"
      }
    }, {
      name: "typescript-axios",
      route: "/guides/client-templates/typescript-axios",
      frontMatter: {
        "sidebarTitle": "TypeScript Axios"
      }
    }, {
      name: "typescript-fetch",
      route: "/guides/client-templates/typescript-fetch",
      frontMatter: {
        "sidebarTitle": "TypeScript Fetch"
      }
    }]
  }, {
    name: "concepts",
    route: "/guides/concepts",
    children: [{
      name: "authenticated-input-specifications",
      route: "/guides/concepts/authenticated-input-specifications",
      frontMatter: {
        "sidebarTitle": "Authenticated Input Specifications"
      }
    }, {
      name: "extract-inline-schemas",
      route: "/guides/concepts/extract-inline-schemas",
      frontMatter: {
        "sidebarTitle": "Extract Inline Schemas"
      }
    }]
  }, {
    name: "server-templates",
    route: "/guides/server-templates",
    children: [{
      name: "typescript-koa",
      route: "/guides/server-templates/typescript-koa",
      frontMatter: {
        "sidebarTitle": "TypeScript Koa"
      }
    }]
  }]
}, {
  name: "index",
  route: "/",
  frontMatter: {
    "sidebarTitle": "Index"
  }
}, {
  name: "overview",
  route: "/overview",
  children: [{
    name: "about",
    route: "/overview/about",
    frontMatter: {
      "sidebarTitle": "About"
    }
  }, {
    name: "compatibility",
    route: "/overview/compatibility",
    frontMatter: {
      "sidebarTitle": "Compatibility"
    }
  }, {
    name: "schema-first-design",
    route: "/overview/schema-first-design",
    frontMatter: {
      "sidebarTitle": "Schema First Design"
    }
  }]
}, {
  name: "reference",
  route: "/reference",
  children: [{
    name: "cli-options",
    route: "/reference/cli-options",
    frontMatter: {
      "sidebarTitle": "CLI Options"
    }
  }]
}];