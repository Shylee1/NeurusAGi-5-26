interface ArticleContentProps {
  content: string;
}

function makeExternalLinksSafe(content: string) {
  return content
    .replace(/target=["']_blank["']/gi, 'target="_blank" rel="noopener noreferrer"')
    .replace(/<a(?![^>]*\brel=)/gi, '<a rel="noopener noreferrer"');
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div
      className="prose prose-invert max-w-none"
      style={{
        '--tw-prose-body': 'hsl(180 100% 95%)',
        '--tw-prose-headings': 'hsl(180 100% 41%)',
        '--tw-prose-links': 'hsl(180 100% 41%)',
        '--tw-prose-bold': 'hsl(45 100% 51%)',
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: makeExternalLinksSafe(content) }}
    />
  );
}
