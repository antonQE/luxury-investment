export interface WxrCategory {
  domain: string;
  nicename: string;
  name: string;
}

export interface WxrItem {
  postId: string;
  title: string;
  link: string;
  postType: string;
  status: string;
  slug: string;
  content: string;
  excerpt: string;
  postDateGmt: string | null;
  meta: Record<string, string>;
  categories: WxrCategory[];
  attachmentUrl: string | null;
}

export interface WxrDocument {
  baseBlogUrl: string;
  items: WxrItem[];
}

function cdata(block: string, tag: string): string {
  const re = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`);
  const match = re.exec(block);
  if (match) return match[1] ?? '';
  const plain = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(block);
  return plain?.[1]?.trim() ?? '';
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function parseMeta(block: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const re =
    /<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>/g;
  for (const match of block.matchAll(re)) {
    const key = match[1];
    if (key === undefined) continue;
    meta[key] = match[2] ?? '';
  }
  return meta;
}

function parseCategories(block: string): WxrCategory[] {
  const categories: WxrCategory[] = [];
  const re =
    /<category domain="([^"]*)" nicename="([^"]*)"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
  for (const match of block.matchAll(re)) {
    categories.push({
      domain: match[1] ?? '',
      nicename: decodeURIComponent(match[2] ?? ''),
      name: match[3] ?? '',
    });
  }
  return categories;
}

export function parseWxr(xml: string): WxrDocument {
  const baseBlogUrl = cdata(xml, 'wp:base_blog_url') || 'https://luxuryinvestment.bg';
  const items: WxrItem[] = [];
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1] ?? '';
    const postId = cdata(block, 'wp:post_id') || /<wp:post_id>(\d+)<\/wp:post_id>/.exec(block)?.[1];
    if (postId === undefined || postId === '') continue;
    const attachmentRaw = cdata(block, 'wp:attachment_url');
    items.push({
      postId,
      title: cdata(block, 'title'),
      link: decodeBasicEntities(cdata(block, 'link')),
      postType: cdata(block, 'wp:post_type'),
      status: cdata(block, 'wp:status'),
      slug: cdata(block, 'wp:post_name'),
      content: cdata(block, 'content:encoded'),
      excerpt: cdata(block, 'excerpt:encoded'),
      postDateGmt: cdata(block, 'wp:post_date_gmt') || null,
      meta: parseMeta(block),
      categories: parseCategories(block),
      attachmentUrl: attachmentRaw === '' ? null : attachmentRaw,
    });
  }
  return { baseBlogUrl, items };
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
