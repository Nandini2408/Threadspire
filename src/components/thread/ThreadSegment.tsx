import React from 'react';

interface Segment {
  id: string;
  content: string;
  type: string;
}

interface ThreadSegmentProps {
  segment: Segment;
  isLast: boolean;
}

const ThreadSegment = ({ segment }: ThreadSegmentProps) => {
  return (
    <div className="thread-segment relative">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: segment.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>') }} />
      </div>
    </div>
  );
};

export default ThreadSegment;
