export enum Website {
  'Gelbooru' = 'https://gelbooru.com/index.php?page=post&s=list',
  'Danbooru' = 'https://danbooru.donmai.us/posts?',
  'Safebooru' = 'https://safebooru.org/index.php?page=post&s=list',
}

export interface ImageHandlerOptions {
  site: keyof typeof Website;
  query: string;
  nsfw?: boolean;
}
