import type { HlsVariant } from '@/domain/streaming/entities/HlsVariant';

export class HlsManifestGenerator {
  generateMasterPlaylist(variants: HlsVariant[], baseUrl: string): string {
    let manifest = '#EXTM3U\n';
    manifest += '#EXT-X-VERSION:3\n\n';

    const sortedVariants = [...variants].sort((a, b) => a.bandwidth - b.bandwidth);

    for (const variant of sortedVariants) {
      const streamInf = this.buildStreamInfLine(variant);
      const playlistUrl = `${baseUrl}/${variant.quality.toLowerCase()}/playlist.m3u8`;
      manifest += `${streamInf}\n${playlistUrl}\n`;
    }

    return manifest;
  }

  generateVariantPlaylist(variant: HlsVariant, segmentBaseUrl: string): string {
    let manifest = '#EXTM3U\n';
    manifest += '#EXT-X-VERSION:3\n';
    manifest += `#EXT-X-TARGETDURATION:${Math.ceil(variant.segmentDuration)}\n`;
    manifest += '#EXT-X-MEDIA-SEQUENCE:0\n';
    manifest += '#EXT-X-PLAYLIST-TYPE:VOD\n\n';

    for (let i = 0; i < variant.segmentCount; i++) {
      manifest += `#EXTINF:${variant.segmentDuration.toFixed(6)},\n`;
      manifest += `${segmentBaseUrl}/segment${i.toString().padStart(3, '0')}.ts\n`;
    }

    manifest += '#EXT-X-ENDLIST\n';
    return manifest;
  }

  private buildStreamInfLine(variant: HlsVariant): string {
    let line = `#EXT-X-STREAM-INF:BANDWIDTH=${variant.bandwidth}`;

    if (variant.resolution) {
      line += `,RESOLUTION=${variant.resolution}`;
    }

    line += `,CODECS="${variant.codecs}"`;

    return line;
  }
}
