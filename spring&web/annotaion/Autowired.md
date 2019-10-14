## Spring Annotation

객체를 주입하는 방법
 1. 생성자를 통한 주입.
 2. Setter 메소드를 통한 주입.

------------------------------
 

### 생성자를 통한 주입.

#### @Autowired: 스프링이 타입(class)을 우선으로 bean 객체를 검색

   * BinarySearchImpl은 SortAlgorithm 을 depends on 한다.
   * SortAlgorithm은 BinarySearchImpl의 dependency다.
   * autowiring 의 bean 선택은 3가지 (우선순위순)
   * 1. @Qualifier
   * 2. @Primary
   * 3. 변수명을 dependency 빈 이름으로 (ex private SortAlgorithm bubbleSortAlgorithm)
   
   
#### @Resource: 스프링이 이름(id)을 우선으로 bean 객체를 검색

  * resourcing 의 bean 선택
  * 지정한 name과 id가 같은 bean 객체
  * 타입이 같은 bean 객체
  * 만약 타입이 같은 bean 객체가 2개 이상이면, 변수명과 id가 같은 bean 객체
  *  @Qualifier가 지정한 bean 객체
  

