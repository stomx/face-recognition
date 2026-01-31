import type { faceapi } from '@/shared/lib/face-api';
import type { CoordinateTransformer } from '@/shared/lib/canvas/CoordinateTransformer';

/**
 * 얼굴 랜드마크 메쉬를 렌더링하는 클래스
 */
export class FaceMeshRenderer {
  constructor(private readonly transformer: CoordinateTransformer) {}

  /**
   * 얼굴 박스 렌더링
   */
  renderFaceBox(
    ctx: CanvasRenderingContext2D,
    box: { x: number; y: number; width: number; height: number }
  ): void {
    const topLeft = this.transformer.transform(box.x, box.y);
    const bottomRight = this.transformer.transform(
      box.x + box.width,
      box.y + box.height
    );

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
  }

  /**
   * 얼굴 랜드마크 메쉬 렌더링
   */
  renderLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: faceapi.FaceLandmarks68
  ): void {
    const positions = landmarks.positions;

    // 1. 얼굴 윤곽선 (턱선)
    this.drawJawline(ctx, positions);

    // 2. 눈썹
    this.drawEyebrows(ctx, positions);

    // 3. 코
    this.drawNose(ctx, positions);

    // 4. 눈
    this.drawEyes(ctx, positions);

    // 5. 입
    this.drawMouth(ctx, positions);

    // 6. 모든 포인트
    this.drawAllPoints(ctx, positions);
  }

  /**
   * 턱선 그리기 (0-16)
   */
  private drawJawline(
    ctx: CanvasRenderingContext2D,
    positions: faceapi.Point[]
  ): void {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= 16; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }

    ctx.stroke();
  }

  /**
   * 눈썹 그리기 (17-26)
   */
  private drawEyebrows(
    ctx: CanvasRenderingContext2D,
    positions: faceapi.Point[]
  ): void {
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
    ctx.lineWidth = 2;

    // 왼쪽 눈썹 (17-21)
    ctx.beginPath();
    for (let i = 17; i <= 21; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 17) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // 오른쪽 눈썹 (22-26)
    ctx.beginPath();
    for (let i = 22; i <= 26; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 22) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  /**
   * 코 그리기 (27-35)
   */
  private drawNose(
    ctx: CanvasRenderingContext2D,
    positions: faceapi.Point[]
  ): void {
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 2;

    // 코 브릿지 (27-30)
    ctx.beginPath();
    for (let i = 27; i <= 30; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 27) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // 코 하단 (31-35)
    ctx.beginPath();
    for (let i = 31; i <= 35; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 31) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  /**
   * 눈 그리기 (36-47)
   */
  private drawEyes(
    ctx: CanvasRenderingContext2D,
    positions: faceapi.Point[]
  ): void {
    ctx.strokeStyle = 'rgba(255, 100, 255, 0.8)';
    ctx.lineWidth = 2;

    // 왼쪽 눈 (36-41)
    ctx.beginPath();
    for (let i = 36; i <= 41; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 36) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    // 오른쪽 눈 (42-47)
    ctx.beginPath();
    for (let i = 42; i <= 47; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 42) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  /**
   * 입 그리기 (48-67)
   */
  private drawMouth(
    ctx: CanvasRenderingContext2D,
    positions: faceapi.Point[]
  ): void {
    // 입 바깥 윤곽 (48-59)
    ctx.strokeStyle = 'rgba(255, 80, 80, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 48; i <= 59; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 48) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    // 입 안쪽 윤곽 (60-67)
    ctx.strokeStyle = 'rgba(255, 120, 120, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 60; i <= 67; i++) {
      const p = this.transformer.transform(positions[i].x, positions[i].y);
      if (i === 60) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  /**
   * 모든 랜드마크 포인트 그리기
   */
  private drawAllPoints(
    ctx: CanvasRenderingContext2D,
    positions: faceapi.Point[]
  ): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

    positions.forEach((point) => {
      const p = this.transformer.transform(point.x, point.y);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
}
