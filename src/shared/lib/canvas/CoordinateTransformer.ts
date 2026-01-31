/**
 * 비디오 좌표를 캔버스 좌표로 변환하는 클래스
 *
 * object-contain 동작 구현:
 * - 비율을 유지하면서 컨테이너 안에 완전히 들어감
 * - 패딩 추가 (letterbox/pillarbox)
 */
export class CoordinateTransformer {
  private readonly scale: number;
  private readonly offsetX: number;
  private readonly offsetY: number;

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const videoAspect = videoWidth / videoHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    if (canvasAspect > videoAspect) {
      // Canvas가 video보다 가로로 넓음 → 세로에 맞추고 가로 패딩
      this.scale = canvasHeight / videoHeight;
      this.offsetX = (canvasWidth - videoWidth * this.scale) / 2;
      this.offsetY = 0;
    } else {
      // Canvas가 video보다 세로로 김 → 가로에 맞추고 세로 패딩
      this.scale = canvasWidth / videoWidth;
      this.offsetX = 0;
      this.offsetY = (canvasHeight - videoHeight * this.scale) / 2;
    }
  }

  /**
   * video 좌표를 canvas 좌표로 변환
   */
  transform(x: number, y: number): { x: number; y: number } {
    return {
      x: x * this.scale + this.offsetX,
      y: y * this.scale + this.offsetY,
    };
  }

  /**
   * Getter 메서드들
   */
  getScale(): number {
    return this.scale;
  }

  getOffsetX(): number {
    return this.offsetX;
  }

  getOffsetY(): number {
    return this.offsetY;
  }
}
