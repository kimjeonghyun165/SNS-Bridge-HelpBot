import { Test, TestingModule } from '@nestjs/testing';
import { KakaoTalkService } from './kakao-talk.service';

describe('KakaoTalkService', () => {
  let service: KakaoTalkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KakaoTalkService],
    }).compile();

    service = module.get<KakaoTalkService>(KakaoTalkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
