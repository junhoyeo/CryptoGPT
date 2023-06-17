import styled from '@emotion/styled';
import clsx from 'clsx';
import { useCallback, useEffect, useRef } from 'react';

type InputProps = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
};

export const Input: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & InputProps> = ({
  value,
  setValue,
  className,
  ...props
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const revalidate = useCallback(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef.current]);

  useEffect(() => {
    revalidate();
  }, [value, revalidate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target?.value);
    },
    [setValue],
  );

  const onBlur = useCallback(() => {
    setValue((v) => v.trim());
    revalidate();
  }, [setValue, revalidate]);

  return (
    <TextAreaWithoutScrollbar
      className={clsx('resize-none', className)}
      onChange={handleChange}
      ref={textAreaRef}
      rows={1}
      value={value}
      onBlur={onBlur}
      {...props}
    />
  );
};

const TextAreaWithoutScrollbar = styled.textarea`
  /* Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
`;
