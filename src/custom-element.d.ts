import React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'x-tooltip': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { content?: string },
        HTMLElement
      >;
    }
  }
}