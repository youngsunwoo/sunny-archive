# Chapter14 HTTP

[[toc]]

## HTTP메서드

### `Q1. HTTP란 무엇인가?`

HTTP 프로토콜이 어떻게 작동되는지 확인해보는 좋은 방법은 텔넷 어플리케이션을 이용해 HTTP요청을 수행해 보는 것이다.

- 위키피디아에 80포트로 텔넷 연결하기

```command
> telnet en.wikipidia.org 80
Trying 91.198.174.255...
Connected to wikipidia-lb.esams.wikipidia.org.
Escape character is '^'].
```

- GET /HTTP/1.1 이라는 명령어는 입력하자.  
  GET명령어를 이용해 '/' 페이지를 얻고 1.1버전의 http프로토콜을 사용하라는 의미이다.
  키-값의형식의 헤더는 GET 줄아래에 포함해서 전송할 수 있다.

```command
GET /HTTP/1.1

HTTP/1.0 200 OK
Server Apache
X-Content-Type-Options: nosniff
Cache-Control: x-maxage=3600, must-revalidate, max-age=0
Last-Modified: Mon, 13 May 2013 17:07:15 GMT
Vary: Accept-Encoding
Content-length: 6071
Content-Type: text/html; characterSet=utf-8
Connection: close

<!DOCTYPE html>
<html lang="mul" dir="ltr">
.
.
.
</body>
</html>

```

- 서버의 응답 첫줄은 HTTP/1.0 200 OK  
  1.0버전의 프로토콜을 이용해 클라이어트에게 성공응답인 200 OK응답을 보낸다.

- 다음행은 응답에 대한 메타 데이터로 클라이언트가 응답의 본문을 어떻게 판단할지 도와주도록 언어와 길이를 반환한다.

- 다음행은 빈 행으로 본문의 시작은 알린다

### `Q2. HTTP메서드란 무엇인가?`

HTTP메서드는 종종 '동사'(verb)로 불리는데 웹서버에 요청한 자원을 이용해 무슨 동작을 해야하는지 알려주기 때문이다.

서버가 구현하는 일반적인 메서드는 아래와 같으며, GET, HEAD 꼭 필요한 메서드이다.

- GET  
  요청된 자원을 제공한다. 변경이 없어야한다.
- PUT  
  요청된 콘텐츠를 위한 자원을 업데이트(덮어쓰기)한다. > 신규 콘텐츠 설정
- POST  
  요청된 콘텐츠를 위한 자원의 내용을 새로 설정한다. > 기존 콘텐츠 업데이트
- DELETE  
  요청된 자원을 삭제한다.
- HEAD  
  GET요청과 비슷하지만 응답코드와 헤더만 반환단다.
- OPTIONS  
  클라이언트가 사용할수 있는 HTTP메서드가 어떤것이 있는지 확인한다.

### `Q3. HTTP응답코드는 무엇을 알려주는가?`

2XX 코드는 요청과 응답이 성공적인 겨우 반환된다.

- 201 Created  
  PUT요청이 성공하고 자원이 생성되었다는 걸 알려준다.
- 204 No Content
- POST  
  요청은 성공했으나 서버는 클라이언트에 추가정보를 제공하지 않는다. 주로 PUT,POST,DELETE 요청을 성공했을때 사용된다.

4XX 코드는 클라이언트가 유효한 만들지 못햇다는 것을 알려준다.

- 400 Bad Request 클라이언트가 잘못된 요청을 보냈다.
- 403 Forbidden 클라이언트가 자원을 요청할 권한이 없다.
- 404 Not Found 요청한 자원이 존재하지 않는다.
- 405 Method Not Allowed 자원 요청시 잘못된 HTTP 메서드를 사용했다.

5XX 코드는 서버 이슈가 있을 경우 반환된다.

- 500 Internal Server Error 일반적으로 메세지로 서버 전체가 아닌 일부 자원만 이용할수 없는 경우
- 503 Service Unavailable 현재 서버를 이용할 수 없다.

---

## HTTP클라이언트

### `Q1. 어떻게 자바 클래스에서 HTTP요청을 보낼 수 있는가?`

- 기본 HTTP요청 구조

```Java
 @Test
	public void makeBareHttpRequest() throws IOException{
		final URL url = new URL("http","en.wikipedia.org","/");
		final HttpURLConnection connection = (HttpURLConnection) url.openConnection();
		connection.setRequestMethod("GET");

		final InputStream responseInputSteam = connection.getInputStream();

		final int responseCode =  connection.getResponseCode();
		final String response = IoUtils.toString(responseInputSteam);

		responseInputSteam.close();

		Assert.assertEquals(200,responseCode);
	}
```

- 아파치 HttpClient 이용

```java
@Test
	public void makeApacheHttpRequest() throws IOException{

		final CloseableHttpClient client = HttpClients.createDefault();
		HttpGet get = new HttpGet("en.wikipedia.org");

		final HttpResponse response = client.execute(get);
		final int responseCode =  response.getStatusLine().getStatusCode();

		final HttpEntity entity = response.getEntity();
		final InputStream responseBody = entity.getContent();

		Assert.assertEquals(200,responseCode);
	}
```

### `Q2. 자바의 내장 클래스를 이용하지 않고 전용 HTTP클라이언드 라이브러리를 이용할 때의 장점은 무엇인가?`

프록시를 통해 HTTP요청을 실행할 때 기본 HttpURLConnection 클래스를 이용하는 경우,  
 시스템 속성인 http.proxyHost와 http.proxyPort를 설정해야 한다.

HttpClient를 사용하는 경우엔 라이브러이에서 AuthenticationbStrategy 인터페이스를 구현해 속성을 붙일수 있다.

또한, 쿠키도 HttpURLConnection 클래스로는 관리할 수 없다.

---

## REST를 이용해 HTTP 서비스 만들기

### `Q1 REST URI는 어떻게 설계 되는가';`

REST URI는 단일자원 혹은 여러가지 자원의 묶음을 가리킨다.  
ex) /user/1234 - id가 1234인 사용자의 세부 정보  
 /users - 모든 사용자의 정보 목록

HTTP 메소드는 자원을 얻기위한 동작이 뭔지 알려준다.  
/user/1234 와 같은 요청을 보내는 경우

- GET 해당 사용자의 정보를 반환한다.
- POST 새로운 사용자를 생성한다.
- PUT 기존 사용자의 정보를 수정한다.
- DELETE 해당 사용자 정보를 삭제하낟.

### `Q2 자바에서 REST서비스를 어떻게 구현할 수 있는가?`

- Spring MVC 를 이용한 REST서비스 설정

```java
@RequestMapping("/users/{id}")
	public String gerUserId(@PathVariable int userId) {
		// id 경로 변수를 userId 변수로 추출함.
	}
```

HTTP서비스의 중요한 기능은 멱등성이다.  
즉, REST서비스의 PUT,DELETE,GET요청을 여러번 요청해도 결과가 달라지지 않아야하며,  
여러번 호출되더라도 한번만 호출된 것과 같은 효과를 내어야 한다.

해당 개념은 클라이언트가 요청이 성공적인지 확신할 수 없는 경우 다시 요청을 보내도 문제가 생기지 않느다는 것이다.
