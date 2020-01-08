# Chapter20# JXM을 이용한 스프링 빈 관리
#
DI는 의존성 관리를 위한 훌륭한 개념이나, 어플리케이션이 배포되어 실행중인 경우에는 DI로 설정을 변경 불가하다.

JMX는 어플리케이션을 관리하고 설정하는 데 사용 가능한 개념으로 java5에 포함되어 있다.
핵심개념은 MBean(Managed Bean:관리빈)으로 관리 인터페이스를 정의하는 메소드를 노출하는 자바 빈이다. 

JXM모듈을 이용하면 스프링 빈 모델을 MBeam으로 익스포트해서 실행중인 어플리케이션의 내부를 들어다보고 설정을 변경할수 있다. 

다음과 같은 네가지 타입이 존재한다.  
```
1) Standard MBeans
   : 리플렉션에 의해 관리 인터페이스가 관리된다.
2) Dynamic MBeans
   : 실행시에 DynamicMBeans 인터페이스 메소드 호출에 의해 관리 인터페이스가 정해진다.
     정적인 인터페이스에 의해 정해지지 않으므로 실행시마다 달라질 수 있다. 
3) Open MBeans
   : 어트리뷰트와 오퍼레이션이 primitive type, class wrapper, primitive, primitiv ewrapper로 분해될수 있는 타입으로 제한된다.
4) Model MBeans
   : 관리인터페이스를 리소스로 넘긴다.
     메타정보를 이용해 관리 인터페이스를 조립하는 팩토리에 의해 만들어진다.
```

## 1. 스프링 빈을 MBean 익스포트하기

기존에는 SplitterService.finsSpittles() 호출 시 인자로 갯수를 전달해서 빌드점에 갯수를 결정했다.  
이제는 JXM을 이용해 실행시점에 결정하도록 변경한다. 

- Spitter 컨트롤러에 spittlesPerPage프로퍼티를 추가한다. 
- 아직까지는 spittlesPerPage프로퍼티도 빈의 프라퍼티로 SpitterController를 MBean으로 노출해야하 한다.
```java
public static final int DEFAULT_SPITTLES_PER_PAGE = 25;
private int spittlesPerPage = DEFUALT_SPITTLES_PER_PAGE;

public void setSpittlesPerPage(int spittlesPerPage){
    this.spittlesPerPage = spittlesPerPage;
}

public int getSpittlesPerPage(){
    return spittlesPerPage;
}
```
  
- 스프링의 MBeanExporter빈을 이용하여 MBean서버에서 스프링빈을 MBean으로 익스포트한다. 
- JConsoledlsk VisualVM과 같은 XML기반 관리도구로 관리가 가능하다.
- 아래와 같이 설정하면 spittleController빈이 SpittleController라는 이름의 모델 MBean으로 MBean관리 서버에 익스포트 된다. 

```java
@Bean
public MBeanExporter mbeanExporter(SpittleController spittleController){
    MBeanExporter exporter = new MBeanExporter();
    Map<String, Object> beans = new HashMap<String, Object> ();
    beans.put("spitter:name=SpittleController, spittleController");
    exporter.setBean(beans);
    retuen exporter;
}
```

- 그림과 같이 SpittleController의 모든 public 멤도는 MBean 오퍼레이션과 애트리뷰트로 익스포트된다.  
- 하지만 우리가 원하는건 spittlesPerPage 프로퍼티를 설정하는것으로 다른 부분은 필요없다.
- MBean 인포어셈블러(info assembler)란? 어프리뷰트와 오퍼레이션을 제어하는 핵심역할을 한다.  
- MBean의 어트리뷰트와 오퍼레이션을 선택/제어하기 위해 스프링은 이름,인터페이스,어노테이션 기반 세가지 옵션을 제공한다.


### 1.1 이름으로 메소드 노출하기

#### (1) MethodNameBasedMBeanInfoAssembler
- MBean 노출 제한을 위해 MethodNameBasedMBeanInfoAssembler에게 MBean의 인터페이스에 존재하는 메소드만을 포함하도록 Bean설정으로 알려준다. 

```java
@Bean
public MethodNameBasedMBeanInfoAssembler assembler() {
    MethodNameBasedMBeanInfoAssembler assembler =
              new MethodNameBasedMBeanInfoAssembler();
    assembler.setManagedMethods(new String[] {"getSpittlesPerPage", "setSpittlesPerPage"});
    return assembler;
}
```
- setManagedMethods 메소드의 프로퍼티는 MBean의 관리 오퍼레이션으로 노출될 메소드 명이다.
- 사용을 위해 MBeanExporter빈에 와이어링 한다. 
```java
@Bean
public MBeanExporter mbeanExporter( SpittleController spittleController,
                                    MBeanInfoAssembler assembler) {
  MBeanExporter exporter = new MBeanExporter();
  Map<String, Object> beans = new HashMap<String, Object>();
  beans.put("spitter:name=SpittleController", spittleController);
  exporter.setBeans(beans);
  exporter.setAssembler(assembler);
  return exporter;
}
```
#### (2) MethodExclusionMBeanInfoAssembler
- MBean 노출 제한을 위해 MethodExclusionMBeanInfoAssembler 포함하지 않을 메소드 목록을 부여한다. 
```java
@Bean
public MethodExclusionMBeanInfoAssembler assembler() {
    MethodExclusionMBeanInfoAssembler assembler = new MethodExclusionMBeanInfoAssembler();
    assembler.setIgnoredMethods(new String[] { "spittles"});
    return assembler;
}
```
- 이름기반으로 설정 시 명시적이나 복수의 MBeand을 익스포트하는 경우 문제가 발생 할 수 있다. 

### 1.2 인터페이스를 이용해 MBean 오퍼레이션/어트리뷰트 정의
- InterfaceBasedMBeanInfoAssembler는 인터페이스를 이용하여 MBean 관리 오퍼레이션으로 익스포트할 빈의 메소드를 선택한다.  
- 메소드 명이 아닌 인터페이스를 나열한다는 점 외에는 이름 기반과 비슷하게 작동한다.
- 인터페이스를 생성한다. 
```java
public interface SpittleControllerManagedOperations {
    int getSpittlesPerPage();
    void setSpittlesPerPage(int spittlesPerPage);
}
```
- InterfaceBasedMBeanInfoAssembler를 설정한다. 
```java
@Bean
public InterfaceBasedMBeanInfoAssembler assembler() {
  InterfaceBasedMBeanInfoAssembler assembler =
          new InterfaceBasedMBeanInfoAssembler();
  assembler.setManagedInterfaces(
      new Class<?>[] { SpittleControllerManagedOperations.class }
);
  return assembler;
}
```

- 여러개의 메소드를 인터페이스로 합쳐 관리가 가능하고 설정을 깔끔하게 유지가 가능한다. 
- 하지만 결국 관리 오퍼레이션 설정이 중복되는 문제가 발생할 수 있다.

### 1.3 어노테이션 주도 MBean작업 
- MetadataMBeanInfoAssembler라는 어셈블러가 존재하나, 수도으로 와이어링 하기 싫으니..  
- context namespace를 사용하자 
- MBeanExporter대신 아래 설정을 하면 된다.
```java
<context:mbean-export server="mbeanServer" />
```

- 이제 MBean으로 변환하기 위해 클래스에 @ManagedResource 어노테이션을 적용하고 메소드에 @ManagedOperation, @ManagedAttribute를 적용하면 된다. 
#### (1) ManagedAttribute 사용 
```java
@Controller
@ManagedResource(objectName="spitter:name=SpittleController") 
public class SpittleController {
    ...
  @ManagedAttribute   
  public void setSpittlesPerPage(int spittlesPerPage) {
    this.spittlesPerPage = spittlesPerPage;
  }
  @ManagedAttribute  
  public int getSpittlesPerPage() {
    return spittlesPerPage;
  }
}
```
- 만약 setSpittlesPerPage에만 적용하면 값설정만 가능하고 값을 확인은 불가하다. 
- 반대로 getSpittlesPerPage에만 적용하면 읽기 전용으로 설정이 가능하다.

#### (2) ManagedOperation 사용 
```java
@Controller
@ManagedResource(objectName="spitter:name=SpittleController") 
public class SpittleController {
    ...
  @ManagedOperation
  public void setSpittlesPerPage(int spittlesPerPage) {
    this.spittlesPerPage = spittlesPerPage;
  }
  @ManagedOperation
  public int getSpittlesPerPage() {
    return spittlesPerPage;
  }
}
```
- 메소드는 노출되나, spittlesPerPage 프로퍼티는 노출되지 않는다. 
- ManagedOperation는 메소드를 노출할때 사용한다. 

### 1.4 MBean 충돌 처리 
- MBean서버에 이미 존재하는 MBean을 익스포트 하는 경우 MBeanExporter가 InstanceAlreadyExistsException을 던진다. 
- 기본적으로 MBeanExporter의 registrationBehaviorName 프러퍼티, <context:mbean-export>의 registration 어트리뷰트로 관리가 가능

- registrationPolicy를 이용한 충돌처리 3가지 방법 
```
1) FAIL_ON_EXISTING : 동일한 이름이 있으면 실패 (default)
2) IGNORE_EXISTING : 충돌을 무시하고 새로운 빈은 등록하지않는다. 
3) REPLACING_EXISTING : 기존빈을 새로운 빈으로 대체한다. 
```
```java

- IGNORE_EXISTING 설정 예제
@Bean
public MBeanExporter mbeanExporter(SpittleController spittleController,
                                    MBeanInfoAssembler assembler) {
    MBeanExporter exporter = new MBeanExporter();
    Map<String, Object> beans = new HashMap<String, Object>(); beans.put("spitter:name=SpittleController", spittleController); exporter.setBeans(beans);
    //enum값을 사용한다.
    exporter.setAssembler(assembler); exporter.setRegistrationPolicy(RegistrationPolicy.IGNORE_EXISTING); 
    return exporter;
}
```