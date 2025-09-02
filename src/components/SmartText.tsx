interface SmartTextProps {
  text: string;
  className?: string;
  highlightQuestions?: boolean; // New prop to highlight actual questions
}

/**
 * SmartText component handles text formatting for better readability
 * - Converts \n to <br/> tags for manual line control
 * - Preserves &nbsp; for non-breaking spaces
 * - Highlights actual questions vs statements
 * - Maintains semantic text grouping
 */
export function SmartText({ text, className = "", highlightQuestions = false }: SmartTextProps) {
  // Convert \n to <br/> and handle question highlighting
  const formatText = (rawText: string) => {
    return rawText
      .split('\n')
      .map((line, index, array) => {
        // Check if this line is a question (ends with ?)
        const isQuestion = line.trim().endsWith('?');
        
        // Apply different styling for statements vs questions
        let lineClass = '';
        
        if (highlightQuestions) {
          if (isQuestion) {
            lineClass = 'font-bold text-indigo-700';
          } else {
            // Statement styling - slightly muted
            lineClass = 'text-gray-700 font-medium';
          }
        }
        
        return (
          <span key={index}>
            {/* Render line with preserved &nbsp; entities and styling */}
            <span 
              className={lineClass}
              dangerouslySetInnerHTML={{ __html: line }} 
            />
            {/* Add <br/> except for the last line */}
            {index < array.length - 1 && <br />}
          </span>
        );
      });
  };

  return (
    <span className={className}>
      {formatText(text)}
    </span>
  );
}
