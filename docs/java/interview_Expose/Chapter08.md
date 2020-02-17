[[toc]]]]

## 원시타입

#### `Q1. 몇가지 자바 원시타입의 이름을 지정하고 이 타입이 JVM에서 어떻게 처리되는지 설명하라`

원시타입 분류

```
Primitive Type
    ㄴ Boolean Type(boolean)
    ㄴ Numeric Type
        ㄴ Integral Type
            ㄴ Integer Type(short, int, long)
            ㄴ Floating Point Type(float, double)
    ㄴ Character Type(char)
```

**특징**

- 자바에서 기본 자료형은 반드시 사용하기 전에 선언 (Declared)되어야 한다.
- OS에 따라 자료형의 길이가 변하지 않는다.
- 비객체 타입으로서 null 값을 가질 수 없습니다.  
  ㄴ값이 지정되지 않으면 기본값으로 자동 지정된다.  
  ㄴBoolean : false , int : 0 , float : 0.0f

**선언**

- 컴파일러는 int와 long 타입, float와 double타입의 변수를 구분 불가하다.
- long 값 뒤에 L을 붙이면 long 타입, 없으면 int로 인식한다.
- float와 double도 각각 f와 d를 붙여 정의가능하며 d는 생략 가능하다.

```java
//원시 타입 변수 선언
int a = 2;
long b = 2L;

float c = 0.1f;
double d = 0.2d;
```

**종류와크기**

- char 타입은 unsigned로 char범위는 유니코드 값이므로 0~65,535까지 이다.

**타입변환**  
상위 타입으로는 암시적으로 변환 가능하나, 하위타입으로 변환은 명시적으로 지정해줘야 한다.

```java
//상위타입으로 변환
int value = Integer.MAX_VALUE;
long biggerValue = value +1;

//하위 타입으로 변환(
long veryLargeNumber = Long.MAX_VALUE;
int fromLargeNumber = (int) veryLargeNumber;
```

#### `Q2. 왜 Interger.MIN_VALUES에 대응하는 양수가 없는가`

- short, int, long 타입의 이진수 값 저장소는 메모리에서 (0 값을 하나로 유지하기 위해) 2의 보수 값을 사용한다.

**2의 보수 변환법**

- 양수 -> 음수 : NOT 비트 연산 후 1을 더 한다
- 음수 -> 앙수 : 1을 뺸후 NOT 비트 연산을 한다.

양수의 2진수 표현 음수의 2진수 표현

- 가장 작은 음수 -127의 2진수 표현법은 1000 0000 이고 이를 2의 보수를 이용해 양수로 돌리면 (0111 1111 + 0000 0001) 대응하는 양수값이 존재하지 않는다.
- -> 상위 타입인 long이나 BigInteger를 사용하자!
- 따라서 Integer.MAX_VALUE보다 크거나 Integer.MIN_VALUE보다 작은 값을 결과로 갖는 연산을 하려면 에러를 반환하고 이를 오버 플로우라고 한다.

- (sampleCode) 가장 작은 음수 int타입 절대값 찾기

---

## 객체 이용하기

#### `Q1. 자바에서 객체란 무엇인가`

**정의 및 특징**

- 변수들의 컬렌셕으로 개체(entity)와 개체들에 관련된 연산을 제공하는 메서드들의 모음을 의미한다. (상태와 행위)

- 참조 타입으로서 원시타입과 달리 빈 객체를 표현하는 null값이 존재한다.  
  null값으로 설정되거나 함수의 리턴값이 null을 반환할 수 있으나 null인 참조에 대해 메서드 호출은 불가하다 -> nullPointException 발생

- (sampleCode) nullPointException 발생

* 객체는 ‘참조타입’이다.
* 원시타입의 경우 int originValue = 42; 라는 변수가 선언되면 메모리가 할당된다.  
  이후 int copyValue = i; 라는 선언발생 시 새로운 메모리가 할당된다.  
  즉, copyValue값이 변경되더라도 originValue에는 변경이 없다.

* 자바에서 new ArrayList(10)과 같은 구분은 새로운 메모리를 할당한다.  
  List myList = new ArrayList(10) 구문으로 생성된 객체를 변수에 할당할때 메모리에 할당된 위치를 가르키도록 한다.  
  따라서, 한 인스턴스에 변경이 발생하면 다른 인스턴스에 영향을 끼치게 된다.

(sampleCode) 메모리에서 같은 인스턴스를 참조 하는 변수들

#### `Q2. final키워드는 객체 참조에 어떤 영향을 미치는가`

- 지정된 값이 할당되고 난 뒤 메모리의 위치가 변하지 않는다.
- 객체에 final을 정의하는 경우 해당 객체에 대한 참조는 변경 불가하나 객체 내부의 값이 각각 final이 아니라면 변경 가능하다.

#### `Q3 객체의 modifier는 어떻게 작동하는가?`

- private  
  private로 선언한 변수는 해당 ‘클래스’에서만 접근 가능하다. ‘인스턴스’는 달라도 같은 타입인 경우 접근이 가능하다.  
  보통 타입이 같은지 확인할 때 다른 인스턴스의 private변수에 접근하며 hashCode, equal 메서드 구현 시 사용된다.

#### `Q4. 메서드와 변수에 사용되는 static 키워드의 역할`

- static메서드와 변수는 클래스에 내부의 정의되나 인스턴스에 속하지 않는다.
- 보통 인스턴스 명이 아닌 클래스명을

#### `Q5. 다형성과 상속이란`

#### `Q6. 객체의 일부 메서드가 오버라이드 되었을때 어떻게 사용되는가`

---

## 자바배열

#### `Q1. 자바에서는 배열을 어떻게 표현하는가`

- 자바에서는 배열을 ‘객체'로 취급한다.
- -> toString() 메서드를 호출 할 수 있으며 샘플 코드처럼 객체의 컨테이너에 배열을 두는 등 다형적인 방법으로 사용 가능하다.
- -> 배열은 객체이므로 참조로 전달 가능하다.
- 따라서 해당 배열을 참조하는 모든것들이 특정 상황에 의해 변경이 가능하다.
- 분리된 코드에서 참조값이 변경되거나 스레드에서 변경되는 경우 등을 주의해서 작업해야 한다.
  (sampleCode) 배열을 객체처럼 다루기

---

## String이용하기

#### `Q1. String은 메모리에 어떻게 저장되는가?`

- String객체로 표현되는 값들은 char타입의 배열 형태이다.

- JVM과 컴파일러는 String객체를 원시타입처럼 취급한다. 따라서 String 리터럴을 생성시에 new 키워드를 사용할 필요가 없으며, 컴파일시 “”사이의 문자는 String객체로 생성된다.

- 아래 샘플코드에서 두 개의 String객체는 같은 값으로 취급된다.  
  (sampleCode)
- helloString1의 생성 : 생성자에 파라미터로 전달될 문자열을 생성자가 사용할수있도록 전달되며 String 객체가 변하는 것이 아닌 전단된 값을 사본을 얻어 배열의 사본을 만든다.
- helloString2의 생성 : 컴파일러가 “H,e, ... , ! ” 라는 연속된 문자를 인식해 따옴표 안의 값들을 String 객체로 생성한다.
  (sampleCode) String객체 생성하기

#### `Q2. String 객체의 값을 변경할 수 있는가?`

- String의 값은 절대 변하지 않으며, 변경하는것처럼 보이는 모든 메소드는 실제로 String 인스턴스를 반환한다.

(sampleCode)

- 위 코드에서 subString, replace, split 와 같이 String을 “변경” 하는 메소드들은 변경된 String객체의 새 복사본은 반환한다.
- 인스턴스로 표현되는 값은 변경 불가하며, 이는 thread safety를 보장한다.

* Integer, Double, Character, BigInteger와 같은 숫자형 클래스도 모두 불변이다.

#### `Q3. 인터닝이란 무엇인가`

- JVM에는 String을 저장해두는 String pool이 있으며 이를 통해 반복되는 리터럴을 상수화 하여 관리한다.

- String 클래스의 equal메소드를 이용시에 두개의 인스턴스가 같은 메모리를 참조하는 경우에 저 빠르게 비교가 가능한다.

- String 상수 풀은 flyweight design패턴을 이용한 개념으로
  Integer.valueOf() 메서드를 실행하여 -128~127사이의 값을 지정 시 Integer객체의 같은 인스턴스를 반환하는 경우를 예시로 들 수 있다.

---

## 제네릭 이해하기

Q1. 컬렌션 API에서 제네릭을 어떻게 사용하는지 설명하시오

아래 코드에서 List인스턴스에 String객체를 추가하고 같은 인스턴스에서 String 객체에 접근한다.

Q2. 주어진 Stack 클래스의 API가 제네릭을 사용하도록 수정하여라

Q3. 타입의 변화는 제네릭에 어떤 영향을 미치는가

Q3. 구상화 한다는건 어떤 의미인가
