import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중 폰 실기기 테스트용. LAN IP / 임시 터널에서 dev 리소스를 받도록 허용한다.
  // (Next 16 은 기본적으로 외부 오리진의 dev 리소스 요청을 차단해 하이드레이션이 멈춘다)
  allowedDevOrigins: ["192.168.219.100", "*.trycloudflare.com"],
};

export default nextConfig;
