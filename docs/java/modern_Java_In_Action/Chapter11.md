# Chapter11# null대신 Optional 클래스
개발자들은 대부분 NullPointException이 겪어봤을 것이다.  
 

## 1. 값이 없는 상황을 어떻게 처리할까? 
- 아래 코드처럼 자동차,자동자보험을 가진 사람 객체가 구현되어있다.
```java
public class Person {
    private Car car;
    public Car getCar() { return car; }
}
public class Car {
    private Insurance insurance;
    public Insurance getInsurance() { return insurance; }
}
public class Insurance {
    private String name;
    public String getName() { return name; }
}

public String getCarInsuranceName(Person person) {
    return person.getCar().getInsurance().getName();
}
```
- 보험명을 가져오는 getCarInsuranceName에서 어떤 문제가 발생할까? 
- 차를 소유하지 않은 사람이 있는 경우 getCar를 호출하면 null이 반환된다.
- getInsurance는 null을 참조하므로 NullPointException이 발생한다. 
- 마찬가지로 Person이나 getInsurance가 null을 반환하는 경우도 문제가 발생한다.

### `1.1 보수적으로 NullPointException 처리하기`
- NullPointException을 줄이기 위해서는 필요한곳에서 null여부를 확인하는 코드를 추가한다. 
- 아래 방법은 들여쓰기 증가 및 가독성이 떨어진다. 소스도 길어진다. 
- 또, null처리를 잊는 경우 결국 NullPointException이 발생한다. 
```java
// ex1 깊은 의심
public String getCarInsuranceName(Person person) {
    if (person != null) {
        Car car = person.getCar();
        if (car != null) {
            Insurance insurance = car.getInsurance();
            if (insurance != null) {
                  return insurance.getName();
            }
        }
    }
    return "Unknown";
}

// ex1 너무 많은 출구
public String getCarInsuranceName(Person person) {
    if (person == null) {
        return "Unknown";
    }
    Car car = person.getCar();
    if (car == null) {
        return "Unknown";
    }
    Insurance insurance = car.getInsurance();
    if (insurance == null) {
        return "Unknown";
    }
    return insurance.getName();
}
```

### `1.2 null때문에 발생하는 문제`
- 에러의 근원이다.  
: NullPointException은 자바에서 가장 흔하게 발생하는 에러다.
- 코드를 어지럽힌다.  
: 중첩된 null확인 구분들이 추가되어야하므로 소스 가독성이 떨어진다.
- 아무 의미가 없다.  
: null은 아무 의미도 표현하지 않는다. 특히, 정적 형식언어에서 값이없음을 표한하는 방법으로 적절하지 않다.
- 자바 철학에 위배된다.  
: 자바는 개발자에게 모든 포인터를 숨겼으나 null포인터는 예외된다.
- 형식 시스템에 구멍을 만든다.  
: null은 무형식으며 정보를 가지고 있지 않다. 따라서 모든 참조형식에 선언할 수 있다.  
이런식으로 null이 할단되고 시스템에 다른 부분으로 퍼지면 null의 의미가 모호해진다. 

### `1.3 다른 언어는 null을 어떻게 표현할까?`

- 그루비 같은 언어에서는 safe navigation operator (?.)를 사용하여 null을 해결했다. 
- 체인 호출중 null이 있으면 결과로 null을 반환한다. 
```Groovy 
def carInsuranceName = person?.car?.insurance?.name
```

- 하스텔, 스탈라등은 



  
## 2. Optional 클래스 소개
