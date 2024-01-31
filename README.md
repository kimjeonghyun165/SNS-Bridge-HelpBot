# 다중 SNS 브릿지 봇 - 프로젝트 개요 및 환경 세팅 가이드

### 사용한 스택

- **언어:** 타입스크립트
- **데이터베이스:** 몽고디비
- **프레임워크:** NestJS

---

### 개발 목적

글로벌 시대에 다양한 프로젝트들이 여러 SNS를 통하여 운영되고 있습니다. 그러나 각각의 SNS가 다른 플랫폼에 속해있어서 발생하는 소통의 벽을 해결하기 위해 해당 프로젝트는 개발되었습니다. 여러 인종과 언어로 이루어진 프로젝트들이 텔레그램, 디스코드, 카카오톡을 자유롭게 활용하여 소통할 수 있도록 하는 것이 주요 목적입니다.

### 기능 개요

텔레그램과 카카오톡, 텔레그램과 디스코드, 디스코드와 카카오톡의 3가지 플랫폼 간의 양방향 또는 단방향 메시지 전달이 가능합니다. 이를 통해 사용자들은 편리하게 각자 선호하는 SNS를 통해 소통할 수 있으며, 프로젝트의 글로벌 활동에 더 많은 참여를 이끌어낼 수 있습니다.

### 옵션

1. **링크 제어 옵션:** 운영자는 링크 형태의 메시지를 전송할지 여부를 제어할 수 있습니다. 이 기능은 스캠 링크를 방지하기 위해 추가되었습니다.
2. **텔레그램 공지 옵션:** 텔레그램의 소통방과 공지방을 고려하여, 운영자가 공지 옵션을 설정하면 해당 메시지는 공지 형태로 링크와 함께 다른 SNS로 전달됩니다.
3. **이미지 공유 및 전달 제어:** 텔레그램과 디스코드 간에는 이미지가 서로 공유되지만, 카카오톡으로는 이미지가 공유되지 않습니다. 해당 기능을 통해 사용자는 이미지가 어떻게 전달되고 공유되는지 제어할 수 있습니다.

---

## 환경 세팅 가이드

### 패키지 설치 및 토큰값 설정

```bash
npm install

## src/config/config.service.ts
## .env 파일을 생성하여 해당 값 설정
## 포트값은 도커 포트와 맞추어줄 것
this.discordToken = process.env.DISCORD_API_TOKEN || '';
this.telegramToken = process.env.TELEGRAM_API_TOKEN || '';
this.mongoToken = process.env.MONGODB_API_TOKEN || '';
this.imgurl = process.env.IMGUR_CLIENT_ID || '';
this.port = parseInt(process.env.PORT) || 3004;

```

### 모바일 서버 구성

메신저봇R 어플을 다운로드하고, 에뮬레이터(리드로이드)를 통해 환경을 세팅합니다. 모바일 서버에서는 프로젝트의 remote-kakao 라이브러리를 이용하여 서버와의 통신을 담당하게 됩니다.

### 서버 설정

서버 측에서는 remote-kakao 패키지를 통해 카카오톡 봇을 초기화하고, 필요한 기능들을 구현합니다. 텔레그램과 디스코드와의 연동 코드와 함께, 카카오톡과의 통신을 위한 라우팅을 설정합니다.

### 실행 및 테스트

세팅이 완료되면 서버를 실행하고, 모바일 서버를 통해 메신저봇R 어플을 실행하여 카카오톡 메시지가 서버로 송수신이 잘 되는지 봇의 동작을 테스트합니다.

### 리드로이드를 이용한 환경 구성 권장

에뮬레이터를 이용한 환경 구성을 권장합니다. 리드로이드는 안정적이며 다양한 설정이 가능하여 테스트 및 개발 시에 유용하게 활용할 수 있습니다.

이렇게 구성된 다중 SNS 브릿지 봇은 타입스크립트와 NestJS, 몽고디비를 기반으로 안정적이고 확장 가능한 아키텍처를 구축하여 다양한 프로젝트에 유연한 소통 경로를 제공합니다.

---

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
