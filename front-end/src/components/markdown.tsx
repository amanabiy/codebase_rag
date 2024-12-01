import { ComponentProps, FC, memo } from 'react';
import { type MDXComponents } from 'mdx/types';
import { ErrorBoundary } from 'react-error-boundary';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import SyntaxHighlighter from 'react-syntax-highlighter';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const components: MDXComponents = {
    h1: ({ className, ...props }: ComponentProps<'h1'>) => (
        <h1
            className={cn(
                'mt-2 flex w-full items-center gap-1 text-3xl font-extrabold tracking-tight',
                className
            )}
            {...props}
        />
    ),
    code({ inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className ?? '');
        return !inline && match ? (
          <SyntaxHighlighter
            language={match[1]}
            PreTag="div"
            children={String(children).replace(/\n$/, '')}
            {...props}
          />
        ) : (
          <code className={className} {...props} />
        );
      },
};

const MemoizedReactMarkdown: FC<Options> = memo(
    ReactMarkdown,
    (prevProps, nextProps) =>
        prevProps.children === nextProps.children && prevProps.className === nextProps.className
);

export function RenderMessage({ children }: { children: string }) {
    return (
        <ErrorBoundary fallback={<div className='whitespace-pre-wrap'>{children}</div>}>
            <MemoizedReactMarkdown components={components} remarkPlugins={[remarkGfm /* additional plugins */]}>
                {children}
            </MemoizedReactMarkdown>
        </ErrorBoundary>
    );
}