# chapter1# Spring속으로

Spring  (Road Johnson)

### 1.등장배경 : "자바 개발의 간소화"
엔터프라이즈의 개발의 복잡함을 해소하기 위해 등장  
EJB로만 개발 가능한던 작업들을 단순 자바 빈으로도 가능하도록 해준다  
-> 간소함 / 테스트 용이성 / 낮은 결합도  

### 2.전략과 특징 
**2.1 POJO**  
getter / setter를 가진 단순한 자바 오브젝트  
getter / setter를 가진 단순한 자바 오브젝트 > 의존성도 없고, 테스트도 용이하며 추후 수정이 편리  

**2.2 DI**  
객체를 직접 생성하지 않고 외부로 부터 주입 받아 사용 -> 결합도가 낮아짐   
* DI가 적용되지 않은 경우  
   짱구 에피소드 밖에 플레이할수 없는 TV  
```java
public class VideoConnetTV implement TV (){
    private ZzangguEpicodeVideo video;

    public VideoConnetTV() {
        this.video = new ZzangguEpicodeVideo();
    }
    
    public void playTheVideo () {
        video.play();
    }
}
```
 
* DI가 적용된 경우   
  외부에서 비디오를 주입받아 플레이가 가능한 TV  
  : 생성자 주입 방법
```java
public class VideoConnetTV implement TV )
    private Video video;

    public VideoConnetTV(Video video) {
        this.video = video;
    }
    
    public void playTheVideo () {
        video.play();
    }
}
```
   : 셋터 주입 방법
```java
public class VideoConnetTV implement TV )
    private Video video;

    public VideoConnetTV() {
    }
    
    public void setVideo(Video video)(){
        this.video = video;
    }

    public void playTheVideo () {
        video.play();
    }
}
```

**2.3 AOP**  
관심사의 분리 : 각 서비스에서 공통적으로 처리되어야하는 “횡단관심사”를 분리한다. > 중복코드의 제거  
로깅/보안/트랜젝션 관리 등  
게임을 위한 TV이건 비디오를 위한 TV이건 TV(전자기기)종류는 모두 전원 On/Off가 필요  
```java
public class Power() {
     public void trunOn () {
        stream.println(“Trun on. Hello");
    }

    public void trunOff () {
        stream.println(“Trun off. Bye~");
    }
}
```

* AOP 적용 되지 않은 경우  
```java
public class VideoConnetTV implement TV )
    private ZzangguEpicodeVideo video;
    private Power power;

    public VideoConnetTV(Video video, Power power) {
        this.video = video;
        this.power = power;
    }
    
    public void playTheVideo () {
        power.trunOn();            
        video.play();        
        power.trunOff();
    }
}
```

```xml
<aop:config>
    <aop:aspect ref=“power">
        <aop:pointcut id=“play" expression=“excution(* * .paly(…))"/>
        <aop:before pointcut-ref="play" method="trunOn"/>
        <aop:after pointcut-ref="play" method="trunOff"/>
    </aop:aspect>
</aop:config>
```

**2.4 Templet**  
공통작업을 위한 코드를 분리 > 코드 유사성 제거 > 작업자체에 집중할수 있도록 한다.  
JDBC, RestTemplet 등  
 

### 3. 핵심(?) 개념들  
**3.1 컨테이너**  
컨데이너란? 객체(빈)를 관리하는 그릇    
         객체를 생성하고 의존성을 엮어주고 생명주기를 관리     
종류 : Bean Factory - DI를 지원하는 가장 기본적인 형태    
         Application Context  - Bean Factory의 확장 (프로퍼티설정 읽기/이벤트 발행)   
         ㄴAnnotationConfigApplicationContext  
         ㄴAnnotationConfigWebApplicationContext 
         ㄴClassPathXmlApplicationContext  
         ㄴFileSystemXmlApplicationContext  
         ㄴXmlWebApplicationContext  

**3.2 Bean Life Cycle**
 (1) 빈 인스턴스화  
 (2) value, reference을 빈의 프로터티에 주입  
 (3) 빈이 BeanNameAware구현 > Spring은  id를 setBeanName으로 넘긴다  
 (4) 빈이 BeanFactoryAware구현 > setBeanFactory() 호출 > 빈팩토리 자체를 넘긴다  
 (5) 빈이 ApplicationAContextAware구현 > setApplication 호출  
 (6) BeanPostProcesser 인터페이스 구현 > postProcessBeforeInitialization() 호출  
 (7) Initializing Bean 인터페이스 구현 > afterPropertiesSet() 호출   
       *  init-methoed확인  
 (8) BeanPostProcesser구현 > postProcessAfterInitialization() 호출  
 (9) Bean사용 준비완료! until ~Application Context소멸  
(10) Disposable Bean 인터페이스 구현 > destroy()호출  
       * destroy-method 확인   
