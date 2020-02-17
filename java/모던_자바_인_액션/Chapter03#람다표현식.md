# 1. 람다란 무엇인가?

람다 표현식이란 메서드로 전달 할 수 있는 익명함수를 단순화한 것이다.  
함수명은 없지만 파라미터 리스트, 바디, 반환현식, 발생가능한 예외리스트를 가진다.

[람다의 특징]

- 익명 : 이름이 없으므로 익명함수라고 표현한다.
- 함수 : 메서드처럼 특정 클래스에 종속되지 않으므로 함수라고 부른다.  
   메서드처럼 파라미터 리스트, 바디, 반환현식, 발생가능한 예외리스트를 포함한다.
- 전달 : 람다표현식을 메서드 인수로 전달하거나 변수로 저장할 수 있다.
- 간결성 : 익명클래스처럼 많은 코드를 구현할 필요가 없다.

람다는 이전장에서 살펴본것처럼 코드를 전달하는 과정에서의 지저분한 코드를 줄일 수 있다.

- AS-IS

```java
Comparator<Apple> byWeight = new Comparator<Apple>() {
    public int compare(Apple a1, Apple a2){
        return a1.getWeight().compareTo(a2.getWeight());
    }
};
```

- TO-BE (람다사용)

```java
Comparator<Apple> byWeight =
    (Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight());
```

람다 표현식은 파라미터, 화살표, 바디로 이루어진다.
![람다표현식](../../image/java/모던자바_인_액션/Figure_3.1.png)

- 파라미터 리스트 : Comparator의 compareTo 메서드 파라미터 (사과 2개)
- 화살표 : -> 로 파라미터와 바디를 구분
- 람다 바디 : 두 사과의 무게를 비교, 람다의 return값에 해당하는 표현식

자바8에서 지원하는 다섯가지 람다 표현식 Sample Code

```java
//Sring 형식의 파라미터를 하나 가지며 int를 반환한다.
(String s) -> s.length()

//Apple 형식의 파라미터를 하나 가지며 사과 무게가 150을 넘는지 boolean을 반환한다.
(String s) -> s.length()


//int형식 2개 파라미터를 가지며 리턴값이 없다(void). 람다 바디는 여러행을 포함할 수 있다.
(int x, int y) -> {
    System.out.println("Result:");
    System.out.println(x + y);
}

//파라미터가 없으며 int42를 반환한다.
() -> 42

//Apple 형식의 파라미터를 두개 가지며 int(두 사과 무게 비교 결과)를 리턴한다.
(Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight())
```

람다 사용 사례

```java
// 불리언 표현식
(List<String> list) -> list.isEmpty()

// 객체 생성
() -> new Apple(10)

// 객체에서 소비
(Apple a) -> { System.out.println(a.getWeight()); }

// 객체에서 선택/추출
(String s) -> s.length()

// 두 값을 조합
(int a, int b) -> a * b

// 두 값을 비교
(Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight())
```

# 2. 어디에, 어떻게 람다를 사용할까?

## 2.1 함수형 인터페이스
