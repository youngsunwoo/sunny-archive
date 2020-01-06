# Chapter19 이메일전송하기
  

## 1. 이메일 전송을 위해 스프링 설정하기

스프링에서는 MainSander 구현체를 통해 이메일 서버에 연결하여 메일을 전송한다.
  
### 1.1 이메일 전송자 설정하기 

```java
    @Bean
    public MailSender mainSender(Environment env){
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(env.getProperty("mailserver.host"));
        mailSender.setPort(env.getProperty("mailserver.port"));
        mailSender.setUsername(env.getProperty("mailserver.username"));
        mailSender.setPassword(env.getProperty("mailserver.password"));
        return mailSender;
    }
```
- JavaMailSenderImpl는 간단한 빈 설정으로 생성 가능하다. 
- host,port,username,password는 모두 선택사항으로 외부파일에서 설정을 가져오도록 구현했다.  
- port의 dafault값은 25(SMPT)이다.   

- JavaMailSenderImpl는 자신의 메일 세션을 위해 설정된다.     
- javax.mail.MailSession 객체를 구성해놓자? -> JNDI를 통해 설정하는 경우 JavaMailSenderImpl 직접 서버 설정을 가지고있을 필요가 없다.   
 
```java
    @Bean
    public JdniObjectFactoryBean mailSession(){
        JdniObjectFactoryBean jndi = new JdniObjectFactoryBean();
        jndi.setJndiName("mail/session");
        jndi.setProxyInterface(MailSession.class);
        jndi.serResourceRef(true));
        return mailSender;
    }
```
- JNDI에서 사용할 MailSession을 설정한다. 
```java
@Bean
    public MailSender mainSender(Environment env){
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setSession(mailSession);
        return mailSender;
    }
```
- JdniObjectFactoryBean을 사용하여 MailSession을 검색할수 있도록 빈을 설정한다.
- 메일 세션을 JavaMailSenderImpl의 session프라퍼티에 연결해줌으로서 기존의 명시적인 서버 정성을 교체했다.   
 
### 1.2 메일서버를 와이어링 하고 사용하기
```java
    public class SpitterEmailServiceImpl {
    
        @Autowired
        JavaMailSender mailSender;
    
        public void sendSimpleSpitteleEmail(String to, Spitter spitter){
            SimpleMailMessage message = new SimpleMailMessage();
            String spitterName = spitter.getSpitter().getFullName();
    
            message.setFrom("sunny@sunny-archive.com");                     //송신자           
            message.setTo(to);                                              //수신자 
            message.setSubject("New Spitter from "+spitterName);            //제목    
            message.setText(spitterName+" says : " + spitter.getText());    //본문    
            mailSender.send(message);                                       //메일전송
        }
    }
```
---
## 2. 이메일 메세지는 풍부하게 꾸미기
### 2.1 파일첨부 추가하기
- 첨부파일이 포함된 메일은 멀티파트 메세지(MIME : Multipurpose Internet Mail Extension)를 생성해야 한다.
- MailSender의 createMimeMessage()를 통해 해당 작업을 시작하자
```java
   MimeMessage message = mailSender.reateMimeMessage();
```

- MineMessageHelper를 이용해 MimeMessage api를 다룰 수 있다.
- 두번째 파람에 true를 줌으로서 멀티파트메세지임을 명시한다.
```java
   MimeMessageHelper helper = new MimeMessageHelper(message, true);
```
- message가 아닌 helper메소드를 통해 메세지를 생성한다. 

```java
    public void sendSpittleEmailWithAttachment(String to, Spittle spittle) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);                            //helper 메세지 생성
    
        String spitterName = spittle.getSpitter().getFullName();
        helper.setFrom("sunny@sunny-archive.com");
        helper.setTo(to);
        helper.setSubject("New spittle from " + spitterName);
        helper.setText(spitterName + " says: " + spittle.getText());
        FileSystemResource couponImage = new FileSystemResource("/collateral/coupon.png");          //리소스 로드 
        helper.addAttachment("Coupon.png", couponImage);                                            //첨부추가 (리소스명,리소스)
        mailSender.send(message);
    }
```
### 2.2 리치 콘텐츠를 이용한 이메일 전송
- helper의 두번째 파람에 true를 전달함으로서 메세지 텍스트를 HTML로 설정가능하다.
```java
    helper.setText("<html><body><img src='cid:spitterLogo'>" +
      "<h4>" + spittle.getSpitter().getFullName() + " says...</h4>" +
      "<i>" + spittle.getText() + "</i>" +
          "</body></html>", true);
```

- 내장 이미지를 메세지에 추가하기 위해서는 첨부파일 넣는방식과 유사하게 설정된다. 
- addAttachment 대신 addInline을 호출한다. 
```java
    ClassPathResource image = new ClassPathResource("spitter_logo_50.png");
    helper.addInline("spitterLogo", image);
```

- 전체코드는 아래와 같다ㅣ 
```java
    public void sendRichSpitterEmail(String to, Spittle spittle) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom("sunny@sunny-archive.com");
        helper.setTo(to);
        helper.setSubject("New spittle from " + spittle.getSpitter().getFullName());
        helper.setText("<html><body><img src='cid:spitterLogo'>" +
                        "<h4>" + spittle.getSpitter().getFullName() + " says...</h4>" +
                        "<i>" + spittle.getText() + "</i>" +
                        "</body></html>", true);
        ClassPathResource image = new ClassPathResource("spitter_logo_50.png");
        helper.addInline("spitterLogo", image);
        mailSender.send(message);
    }
```

---
## 3.템플릿을 이용하여 이메일 생성하기

### 3.1 Velocity 사용
- Velocity는 아파치 템플릿 엔진으로 jsp를 대체한다.  
- VelocityEngine을 SpitterEmailServiceImpl에 연결한다. 간단한 Bean 설정으로 가능하다.
- 아래 소스에서 VelocityEngineFactoryBean에 설정해야하는 프로퍼티는 VelocityProperties로 클래스패스에서 템플릿을 로드하도록 설정했다.
```java
    @Bean
    public VelocityEngineFactoryBean velocityEngine() {
      VelocityEngineFactoryBean velocityEngine =  new VelocityEngineFactoryBean();
      Properties props = new Properties();
      props.setProperty("resource.loader", "class");
      props.setProperty("class.resource.loader.class", ClasspathResourceLoader.class.getName());
      velocityEngine.setVelocityProperties(props);
      return velocityEngine;
    }
```
- Autowired를 통해 VelocityEngin을 연결하고 Velocity 템플릿을 String형태로 변환한다. 
```java
    @Autowired
    VelocityEngine velocityEngine;

    Map<String, String> model = new HashMap<String, String>();
    model.put("spitterName", spitterName);
    model.put("spittleText", spittle.getText());
    String emailText = VelocityEngineUtils.mergeTemplateIntoString(velocityEngine, "emailTemplate.vm", model);
```

- 이제 helper에서 setText()에 값만 넘겨주면 된다. 
```java
    helper.setText(emailText, true);
```

- 템플릿은 클래스패스 root 경로의 emailTemplate.vm 라는 이름으로 존재한다. 
```html
    <html>
        <body>
          <img src='cid:spitterLogo'>
          <h4>${spitterName} says...</h4>
          <i>${spittleText}</i>
        </body>
    </html>
```

- 문자열 결합보다 가독성/유지보수측면에서 뛰어나다.

### 3.1 Thymeleaf 사용
- Thymeleaf문법으로 템플릿을 작성한다. 
```html
<!DOCTYPE html>
    <html xmlns:th="http://www.thymeleaf.org">
        <body>
          <img src="spitterLogo.png" th:src='cid:spitterLogo'>
          <h4><span th:text="${spitterName}">Craig Walls</span> says...</h4>
          <i><span th:text="${spittleText}">Hello there!</span></i>
        </body>
    </html>
```


- ThymeleafEngin을 생성하고 생성자 주입을 통해 SpitterEmailServiceImpl에 연결한다.
```java
    @Autowired
    private SpringTemplateEngine thymeleaf;
    
    @Autowired
    public SpitterEmailServiceImpl(SpringTemplateEngine thymeleaf) {
      this.thymeleaf = thymeleaf;
    }
```
- 서블릿 컨텍스트에서 템플릿을 잘 읽을 수 있도록 리졸버를 설정한다. 
- 이메일 템플릿은 클래스 패스에서 읽도록 아래처럼 설정해 준다. 
```java
    //이메일 템플릿 리졸버
    @Bean
    public ClassLoaderTemplateResolver emailTemplateResolver() {
      ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
      resolver.setPrefix("mail/");                                      //프리픽스 설정
      resolver.setTemplateMode("HTML5");
      resolver.setCharacterEncoding("UTF-8");
      setOrder(1);                                                      //우선순위 설정
      return resolver;
    }

    //일반적인 리볼버 
    @Bean
    public ServletContextTemplateResolver webTemplateResolver() {
      ServletContextTemplateResolver resolver = new ServletContextTemplateResolver();
      resolver.setPrefix("/WEB-INF/templates/");
      resolver.setTemplateMode("HTML5");
      resolver.setCharacterEncoding("UTF-8");
      setOrder(2);
      return resolver;
    }
```
- 여러개의 템플릿 리졸버를 사용하도록 템플릿 엔진 설정 
```java
    @Bean
    public SpringTemplateEngine templateEngine(Set<ITemplateResolver> resolvers) {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolvers(resolvers);
        return engine;
    }
```
- 메일 전송을 위해서 Velocity 사용 시와 비슷하게 코드를 작성한다.
```java
    Context ctx = new Context();
    ctx.setVariable("spitterName", spitterName);
    ctx.setVariable("spittleText", spittle.getText());
    String emailText = thymeleaf.process("emailTemplate.html", ctx);
    ...
    helper.setText(emailText, true);
    mailSender.send(message);
```