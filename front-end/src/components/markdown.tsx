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
    h2: ({ className, ...props }: ComponentProps<'h2'>) => (
      <h2
        className={cn(
          'mt-3 text-3xl font-semibold tracking-tight text-gray-900',
          className
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }: ComponentProps<'h3'>) => (
      <h3
        className={cn(
          'mt-2 text-2xl font-semibold tracking-tight text-gray-800',
          className
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }: ComponentProps<'h4'>) => (
      <h4
        className={cn(
          'mt-2 text-xl font-medium tracking-tight text-gray-800',
          className
        )}
        {...props}
      />
    ),
    h5: ({ className, ...props }: ComponentProps<'h5'>) => (
      <h5
        className={cn(
          'mt-2 text-lg font-medium tracking-tight text-gray-700',
          className
        )}
        {...props}
      />
    ),
    h6: ({ className, ...props }: ComponentProps<'h6'>) => (
      <h6
        className={cn(
          'mt-2 text-base font-medium tracking-tight text-gray-700',
          className
        )}
        {...props}
      />
    ),
    p: ({ className, ...props }: ComponentProps<'p'>) => (
      <p
        className={cn('my-2 text-lg text-gray-700', className)}
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
      ol: ({ className, ...props }: ComponentProps<'ol'>) => (
        <ol
          className={cn('list-decimal pl-5', className)} // Adding Tailwind classes for ordered lists
          {...props}
        />
      ),
      ul: ({ className, ...props }: ComponentProps<'ul'>) => (
        <ul
          className={cn('list-disc pl-5', className)} // Adding Tailwind classes for unordered lists
          {...props}
        />
      ),
      blockquote: ({ className, ...props }: ComponentProps<'blockquote'>) => (
        <blockquote
          className={cn(
            'border-l-4 border-gray-300 pl-5 italic text-lg text-gray-600',
            className
          )}
          {...props}
        />
      ),
      a: ({ className, ...props }: ComponentProps<'a'>) => (
        <a
          className={cn(
            'text-blue-600 hover:text-blue-800 underline',
            className
          )}
          {...props}
        />
      ),
      img: ({ className, ...props }: ComponentProps<'img'>) => (
        <img
          className={cn('mx-auto my-4 rounded-md shadow-md', className)}
          {...props}
        />
      ),
      // pre: ({ className, children, ...props }: any) => (
      //   <pre
      //     className={cn('bg-gray-200 p-4 rounded-md overflow-x-auto', className)}
      //     {...props}
      //   >
      //     {children}
      //   </pre>
      // ),
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