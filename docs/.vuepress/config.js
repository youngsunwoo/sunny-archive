module.exports = {
  title: "Sunny Archive",
  description: "개발 관련 블로그",
  base: "/sunny-archive/",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons"
      }
    ]
  ],
  plugins: {
    "@vuepress/back-to-top": true,
    "@vuepress/plugin-medium-zoom": {
      selector: "img"
    }
  },
  themeConfig: {
    sidebar: [
      {
        title: "책읽기",
        path: "/",
        collapsable: true,
        sidebarDepth: 2,
        children: [
          {
            title: "JAVA",
            sidebarDepth: 1,
            children: [
              {
                title: "JAVA 프로그래밍 면접 이렇게 준비한다",
                sidebarDepth: 0,
                children: [
                  {
                    title: "Chapter06# 디자인패턴",
                    path: "/java/interview_Expose/Chapter06"
                  },
                  {
                    title: "Chapter08# 자바기본(1)",
                    path: "/java/interview_Expose/Chapter08"
                  },
                  {
                    title: "Chapter10# 자바가상머신(JVM)이해하기",
                    path: "/java/interview_Expose/Chapter10"
                  },
                  {
                    title: "Chapter14# HTTP",
                    path: "/java/interview_Expose/Chapter14"
                  },
                  {
                    title: "Chapter16# 스프링 프레임워크",
                    path: "/java/interview_Expose/Chapter16"
                  },
                  {
                    title: "Chapter17# 하이버네이트 사용하기",
                    path: "/java/interview_Expose/Chapter17"
                  }
                ]
              }
            ]
          },
          {
            title: "스프링 인 액션",
            sidebarDepth: 0,
            children: [
              {
                title: "Chapter01# Spring속으로",
                path: "/springFramework/springInAction/Chapter01"
              },
              {
                title: "Chapter02# Spring BeanWiring",
                path: "/springFramework/springInAction/Chapter02"
              },
              {
                title: "Chapter03# 고급와이어링",
                path: "/springFramework/springInAction/Chapter03"
              },
              {
                title: "Chapter04# AOP",
                path: "/springFramework/springInAction/Chapter04"
              },
              {
                title: "Chapter05# Spring Web Application",
                path: "/springFramework/springInAction/Chapter05"
              },
              {
                title: "Chapter19# 이메일전송하기",
                path: "/springFramework/springInAction/Chapter19"
              },
              {
                title: "Chapter20# JXM을 이용한 스프링 빈 관리",
                path: "/springFramework/springInAction/Chapter20"
              }
            ]
          }
        ]
      }
    ],
    nav: [
      {
        text: "GitHub",
        link: "https://github.com/youngsunWoo/"
      }
    ],
    searchPlaceholder: "Search..."
  }
}
