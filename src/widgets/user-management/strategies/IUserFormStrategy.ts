/**
 * 사용자 폼 전략 인터페이스
 * OCP(개방-폐쇄 원칙)를 위한 추상화 레이어
 */
export interface IUserFormStrategy {
  /**
   * 사용자 데이터 제출
   * @returns 성공 여부
   */
  submit(params: {
    name: string;
    descriptor: Float32Array;
    imageData: string;
  }): boolean;

  /**
   * 폼 제목 반환
   */
  getTitle(): string;

  /**
   * 제출 버튼 라벨 반환
   */
  getButtonLabel(): string;
}
