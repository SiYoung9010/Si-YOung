import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { getAiFeedback, getAiSuggestionsFromNotes, getBenchmarkingAnalysis, applyAiSuggestion, generateJsonFromImage, insertImageIntoHtml, editImageWithAi, generateImageFromSuggestion } from './services/aiService';
import { generateHtml } from './services/htmlGenerator';
import { INITIAL_HTML_INPUT, INITIAL_JSON_INPUT } from './constants';
import type { AiSuggestion, AiFeedbackResponse, Insight, Reference } from './types';

// Let TypeScript know about the global functions from CDNs
declare const html2canvas: any;
declare const JSZip: any;

const FONT_OPTIONS = [
  'Noto Sans KR',
  'Gothic A1',
  'Nanum Gothic',
  'Nanum Myeongjo',
  'IBM Plex Sans KR',
];

const LoadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
    </svg>
);

const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
    </svg>
);

const CollapseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 1a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 5 1.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 0 3.5 1h-2a.5.5 0 0 1 0-1h2zM1 5.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 1.5 5v2a.5.5 0 0 1-1 0v-2zm14 0a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 1 0v2A1.5 1.5 0 0 1 14.5 5h-2a.5.5 0 0 1 0-1h2zM5 14.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 1 0 1h-2A1.5 1.5 0 0 1 5 14.5v-2a.5.5 0 0 1 1 0v2zm5 0a.5.5 0 0 0 .5.5h2a.5.5 0 0 1 0 1h-2a-1.5 1.5 0 0 1-1.5-1.5v-2a.5.5 0 0 1 1 0v2z"/>
    </svg>
);

const CodeInput: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    hasError: boolean;
    placeholder: string;
}> = ({ id, label, value, onChange, hasError, placeholder }) => (
    <div className="flex flex-col h-full">
        <label htmlFor={id} className="text-sm font-medium text-gray-300 mb-2 sr-only">{label}</label>
        <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`flex-grow w-full p-4 bg-gray-800 text-gray-200 border ${hasError ? 'border-red-500' : 'border-gray-600'} rounded-b-lg resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
            placeholder={placeholder}
        />
    </div>
);


const PreviewPanel: React.FC<{
    html: string;
    isLiveEditEnabled: boolean;
    isFeedbackModeEnabled: boolean;
    onHtmlChange: (newHtml: string) => void;
    onElementFeedback: (feedback: string) => void;
    onImageFeedback: (src: string, target: HTMLImageElement) => void;
}> = ({ html, isLiveEditEnabled, isFeedbackModeEnabled, onHtmlChange, onElementFeedback, onImageFeedback }) => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [feedbackPopup, setFeedbackPopup] = useState({ visible: false, x: 0, y: 0, targetElement: null as HTMLElement | null });
    const [feedbackText, setFeedbackText] = useState('');
    const feedbackInputRef = React.useRef<HTMLInputElement>(null);

    const getElementSelector = (el: HTMLElement | null): string => {
        if (!el) return 'unknown';
        let selector = el.tagName.toLowerCase();
        if (el.id) {
            selector += `#${el.id}`;
        }
        if (el.className && typeof el.className === 'string' && el.className.trim()) {
            selector += `.${el.className.trim().split(/\s+/).join('.')}`;
        }
        return selector;
    };

    const handleSaveFeedback = () => {
        if (feedbackText.trim() && feedbackPopup.targetElement) {
            const selector = getElementSelector(feedbackPopup.targetElement);
            onElementFeedback(`[Element: ${selector}] ${feedbackText}`);
        }
        setFeedbackPopup({ visible: false, x: 0, y: 0, targetElement: null });
        setFeedbackText('');
    };
    
    useEffect(() => {
        if (feedbackPopup.visible) {
            feedbackInputRef.current?.focus();
        }
    }, [feedbackPopup.visible]);

    React.useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        let currentHoverEl: HTMLElement | null = null;
        
        const removeHighlight = () => {
            if (currentHoverEl) {
                currentHoverEl.style.outline = '';
                currentHoverEl = null;
            }
        };
        
        const mouseoverHandler = (e: MouseEvent) => {
            removeHighlight();
            const target = e.target as HTMLElement;
            if (target && target.tagName !== 'BODY' && target.tagName !== 'HTML') {
                 currentHoverEl = target;
                 currentHoverEl.style.outline = target.tagName === 'IMG' ? '3px dashed #f59e0b' : '2px dashed #16a34a';
            }
        };

        const clickHandler = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            removeHighlight();
            const target = e.target as HTMLElement;
            if (!target || target.tagName === 'BODY' || target.tagName === 'HTML') return;

            if (target.tagName === 'IMG') {
                onImageFeedback((target as HTMLImageElement).src, target as HTMLImageElement);
            } else {
                const rect = target.getBoundingClientRect();
                const iframeRect = iframe.getBoundingClientRect();
                setFeedbackPopup({
                    visible: true,
                    x: iframeRect.left + rect.left + window.scrollX,
                    y: iframeRect.top + rect.bottom + window.scrollY + 5,
                    targetElement: target,
                });
            }
        };
        
        const handleInput = () => { // For live edit
            const newHtml = iframe.contentWindow?.document?.documentElement?.outerHTML;
            if (newHtml) {
                onHtmlChange(newHtml);
            }
        };

        const setupIframe = () => {
            if (!iframe.contentWindow || !iframe.contentDocument) return;
            const doc = iframe.contentDocument;
            if (!doc?.body) return;

            // Manage contentEditable state for live edit
            doc.body.contentEditable = isLiveEditEnabled.toString();
            if ((doc.body as any)._handleInput) {
                doc.body.removeEventListener('input', (doc.body as any)._handleInput);
            }
            if (isLiveEditEnabled) {
                (doc.body as any)._handleInput = handleInput;
                doc.body.addEventListener('input', handleInput);
            }

            // Visual indicators for modes
            let outlineStyle = 'none';
            if (isLiveEditEnabled) outlineStyle = '2px solid #3b82f6';
            else if (isFeedbackModeEnabled) outlineStyle = '2px solid #16a34a';
            doc.documentElement.style.outline = outlineStyle;
            doc.documentElement.style.outlineOffset = '-2px';
            
            doc.body.style.cursor = isFeedbackModeEnabled ? 'crosshair' : 'default';

            // Clean up old feedback listeners before attaching new ones
            if ((doc.body as any)._feedbackListeners) {
                 doc.body.removeEventListener('mouseover', (doc.body as any)._feedbackMouseover);
                 doc.body.removeEventListener('mouseout', (doc.body as any)._feedbackMouseout);
                 doc.body.removeEventListener('click', (doc.body as any)._feedbackClick);
                 (doc.body as any)._feedbackListeners = false;
            }

            // Manage event listeners for feedback mode
            if (isFeedbackModeEnabled) {
                (doc.body as any)._feedbackMouseover = mouseoverHandler;
                (doc.body as any)._feedbackMouseout = removeHighlight;
                (doc.body as any)._feedbackClick = clickHandler;
                (doc.body as any)._feedbackListeners = true;
                doc.body.addEventListener('mouseover', mouseoverHandler);
                doc.body.addEventListener('mouseout', removeHighlight);
                doc.body.addEventListener('click', clickHandler);
            }
        };

        // Sync external HTML changes to iframe
        const currentIframeHtml = iframe.contentWindow?.document?.documentElement?.outerHTML;
        if (html && html !== currentIframeHtml) {
            iframe.onload = setupIframe;
            iframe.srcdoc = html;
        } else {
            setupIframe();
        }
        
        // Cleanup on unmount or re-render
        return () => {
            if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
                const doc = iframe.contentDocument;
                 if ((doc.body as any)._handleInput) {
                    doc.body.removeEventListener('input', (doc.body as any)._handleInput);
                 }
                 if ((doc.body as any)._feedbackListeners) {
                    doc.body.removeEventListener('mouseover', (doc.body as any)._feedbackMouseover);
                    doc.body.removeEventListener('mouseout', (doc.body as any)._feedbackMouseout);
                    doc.body.removeEventListener('click', (doc.body as any)._feedbackClick);
                 }
            }
            if (iframe) {
                iframe.onload = null;
            }
        };
    }, [html, isLiveEditEnabled, isFeedbackModeEnabled, onHtmlChange, onElementFeedback, onImageFeedback]);

    return (
        <div className="h-full bg-white border border-gray-600 rounded-b-lg overflow-hidden relative">
            <iframe
                ref={iframeRef}
                id="preview-iframe"
                title="Preview"
                className="w-full h-full border-0"
            />
            {feedbackPopup.visible && (
                <div 
                    className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-3 flex flex-col gap-2"
                    style={{ 
                        top: feedbackPopup.y - (iframeRef.current?.getBoundingClientRect().top || 0), 
                        left: feedbackPopup.x - (iframeRef.current?.getBoundingClientRect().left || 0),
                        maxWidth: '300px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-sm text-gray-300">
                        <span className="font-bold text-green-400">피드백:</span> {getElementSelector(feedbackPopup.targetElement)}
                    </p>
                    <input
                        ref={feedbackInputRef}
                        type="text"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleSaveFeedback() }}
                        placeholder="의견을 작성하세요..."
                        className="bg-gray-700 border border-gray-500 text-white rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="flex gap-2">
                         <button onClick={handleSaveFeedback} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md text-sm">저장</button>
                         <button onClick={() => setFeedbackPopup({ visible: false, x: 0, y: 0, targetElement: null })} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded-md text-sm">취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface DisplaySuggestion extends AiSuggestion {
  generationState?: 'idle' | 'loading' | 'done' | 'error';
  generatedImage?: string;
  generationError?: string;
}

const AiFeedbackPanel: React.FC<{
    feedback: DisplaySuggestion[] | null;
    isLoading: boolean;
    error: string | null;
    onApplySuggestion: (suggestion: string, index: number) => Promise<void>;
    onGenerateImage: (suggestion: string, index: number) => Promise<void>;
    onInsertGeneratedImage: (suggestion: string, index: number, generatedImage: string) => Promise<void>;
    onEditGeneratedImage: (index: number, imageSrc: string) => void;
    applyingSuggestionIndex: number | null;
}> = ({ feedback, isLoading, error, onApplySuggestion, onGenerateImage, onInsertGeneratedImage, onEditGeneratedImage, applyingSuggestionIndex }) => {
    
    // FIX: The conditional return in the original `useMemo` (`if (!feedback) return {}`) caused it to have a union return type.
    // This confused TypeScript's inference for `Object.entries`, leading to `suggestions` being typed as `unknown`.
    // By reducing over `(feedback || [])`, we ensure a consistent `Record` type is always returned, fixing the error.
    const groupedFeedback = useMemo(() => {
        return (feedback || []).reduce((acc, item, index) => {
            const itemWithIndex = { ...item, originalIndex: index };
            (acc[item.category] = acc[item.category] || []).push(itemWithIndex);
            return acc;
        }, {} as Record<string, (DisplaySuggestion & { originalIndex: number })[]>);
    }, [feedback]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            AI가 마케팅 전략을 분석하고 있습니다...
        </div>;
    }

    if (error) {
         return <div className="flex items-center justify-center h-full text-red-400 p-4">{error}</div>;
    }
    
    if (!feedback || Object.keys(groupedFeedback).length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">AI 피드백을 요청하여 페이지를 개선해보세요.</div>;
    }

    return (
        <div className="h-full overflow-y-auto p-4 bg-gray-800 border border-gray-600 rounded-lg space-y-6">
            {Object.entries(groupedFeedback).map(([category, suggestions]) => (
                <div key={category}>
                    <h3 className="text-lg font-semibold text-blue-300 mb-3">{category}</h3>
                    <div className="space-y-4">
                        {suggestions.map((item) => (
                            <div key={item.originalIndex} className="bg-gray-700 p-4 rounded-lg shadow">
                                <p className="text-gray-200 mb-3 whitespace-pre-wrap">{item.suggestion}</p>
                                {category === '연출 사진 제안' ? (
                                    <div className="mt-3">
                                        {item.generationState === 'idle' && (
                                            <button
                                                onClick={() => onGenerateImage(item.suggestion, item.originalIndex)}
                                                disabled={applyingSuggestionIndex !== null}
                                                className="w-full h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold rounded-md shadow-md transition-all duration-300"
                                            >
                                                ✨ AI로 추천 이미지 생성
                                            </button>
                                        )}
                                        {item.generationState === 'loading' && (
                                            <div className="flex items-center justify-center h-10 text-gray-400">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                AI가 이미지를 생성 중입니다...
                                            </div>
                                        )}
                                        {item.generationState === 'error' && (
                                            <div className="text-red-400 p-2 bg-red-900/50 rounded-md">
                                                <p className="font-bold">Error:</p>
                                                <p className="text-sm">{item.generationError}</p>
                                            </div>
                                        )}
                                        {item.generationState === 'done' && item.generatedImage && (
                                            <div className="space-y-3">
                                                <img src={item.generatedImage} alt="AI Generated Suggestion" className="rounded-lg border border-gray-600" />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => onInsertGeneratedImage(item.suggestion, item.originalIndex, item.generatedImage as string)}
                                                        disabled={applyingSuggestionIndex !== null}
                                                        className="flex-1 h-10 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold rounded-md"
                                                    >
                                                        {applyingSuggestionIndex === item.originalIndex ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '➕ 상세페이지에 삽입'}
                                                    </button>
                                                    <button
                                                        onClick={() => onEditGeneratedImage(item.originalIndex, item.generatedImage as string)}
                                                        disabled={applyingSuggestionIndex !== null}
                                                        className="flex-1 h-10 flex items-center justify-center bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-bold rounded-md"
                                                    >
                                                        ✏️ AI로 이미지 수정
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => onApplySuggestion(item.suggestion, item.originalIndex)}
                                        disabled={applyingSuggestionIndex !== null}
                                        className="w-full h-10 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold rounded-md shadow-md transition-all duration-300"
                                    >
                                        {applyingSuggestionIndex === item.originalIndex ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> 
                                        ) : (
                                            '🤖 AI에게 적용 요청 (Ask AI to Apply)'
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const UserFeedbackPanel: React.FC<{ notes: string; onChange: (notes: string) => void; onApply: () => void; isApplying: boolean; }> = ({ notes, onChange, onApply, isApplying }) => (
    <div className="flex flex-col h-full">
        <textarea
            value={notes}
            onChange={(e) => onChange(e.target.value)}
            className="flex-grow w-full p-4 bg-gray-800 text-gray-200 border border-gray-600 rounded-t-lg resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="여기에 자유롭게 피드백, 메모, 할 일 등을 작성하세요..."
        />
        <button
            onClick={onApply}
            disabled={!notes.trim() || isApplying}
            className="h-12 flex-shrink-0 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-wait text-white font-bold rounded-b-lg shadow-lg border border-gray-600 border-t-0 transition-all duration-300 ease-in-out"
        >
            {isApplying ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '📝 AI로 내 피드백 반영하기'}
        </button>
    </div>
);


const BenchmarkingPanel: React.FC<{}> = () => {
    const [image, setImage] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImageName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getBenchmarkingAnalysis(image);
            setAnalysis(result);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error getting analysis: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const renderAnalysis = () => {
        if (!analysis) return null;
        return (
            <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-h2:text-emerald-300 prose-h3:text-blue-300"
                 dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
        );
    };

    return (
        <div className="h-full overflow-y-auto p-4 bg-gray-800 border border-gray-600 rounded-lg">
            {!analysis && (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-full max-w-lg">
                         <label
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">PNG, JPG, or GIF of a competitor's page</p>
                            </div>
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        {imageName && <p className="text-center text-sm text-gray-400 mt-2">Selected: {imageName}</p>}
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={!image || isLoading}
                        className="mt-6 w-48 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-bold rounded-lg shadow-lg"
                    >
                         {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '🔬 이 디자인 분석하기'}
                    </button>
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </div>
            )}
            {analysis && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">Uploaded Image</h3>
                        <img src={`data:image/png;base64,${image}`} alt="Benchmark" className="rounded-lg border border-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">AI Benchmarking Report</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
                                AI가 분석 중입니다...
                            </div>
                        ) : (
                            renderAnalysis()
                        )}
                        <button onClick={() => { setAnalysis(null); setImage(null); setImageName('');}} className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg">Analyze Another</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const KnowledgeBasePanel: React.FC<{}> = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    useEffect(() => {
        try {
            const savedInsights = localStorage.getItem('knowledgeBaseInsights');
            if (savedInsights) {
                setInsights(JSON.parse(savedInsights));
            }
        } catch (error) {
            console.error("Failed to load insights from localStorage", error);
        }
    }, []);

    const handleSaveInsight = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('Title and Content are required.');
            return;
        }
        const newInsight: Insight = {
            id: Date.now().toString(),
            title,
            category,
            content,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };

        const updatedInsights = [...insights, newInsight];
        setInsights(updatedInsights);

        try {
            localStorage.setItem('knowledgeBaseInsights', JSON.stringify(updatedInsights));
        } catch (error) {
            console.error("Failed to save insights to localStorage", error);
        }
        
        setTitle('');
        setCategory('');
        setContent('');
        setTags('');
    };

    const handleDeleteInsight = (id: string) => {
        const updatedInsights = insights.filter(insight => insight.id !== id);
        setInsights(updatedInsights);
        try {
            localStorage.setItem('knowledgeBaseInsights', JSON.stringify(updatedInsights));
        } catch (error) {
            console.error("Failed to save insights to localStorage", error);
        }
    };
    
    return (
        <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800 border border-gray-600 rounded-lg">
            <div className="flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-emerald-300">새로운 인사이트 추가</h2>
                <form onSubmit={handleSaveInsight} className="space-y-4">
                    <div>
                        <label htmlFor="insight-title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <input id="insight-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="insight-category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <input id="insight-category" type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="insight-content" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                        <textarea id="insight-content" value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 resize-none focus:ring-blue-500 focus:border-blue-500" required></textarea>
                    </div>
                    <div>
                        <label htmlFor="insight-tags" className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated)</label>
                        <input id="insight-tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <button type="submit" className="w-full h-12 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-lg">
                        Save Insight
                    </button>
                </form>
            </div>

            <div className="flex flex-col">
                <h2 className="text-xl font-bold text-emerald-300 mb-4">저장된 인사이트</h2>
                <div className="overflow-y-auto h-[calc(100vh-350px)] space-y-4 pr-2">
                    {insights.length === 0 ? (
                        <p className="text-gray-400">No insights saved yet.</p>
                    ) : (
                        [...insights].reverse().map(insight => (
                            <div key={insight.id} className="bg-gray-700 p-4 rounded-lg relative">
                                <button onClick={() => handleDeleteInsight(insight.id)} className="absolute top-2 right-2 text-2xl font-bold text-gray-400 hover:text-red-400 leading-none">&times;</button>
                                <h3 className="font-bold text-lg text-blue-300">{insight.title}</h3>
                                {insight.category && <p className="text-sm text-gray-400 mb-2">Category: {insight.category}</p>}
                                <p className="text-gray-200 whitespace-pre-wrap">{insight.content}</p>
                                {insight.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {insight.tags.map(tag => (
                                            <span key={tag} className="bg-gray-600 text-xs text-gray-300 px-2 py-1 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const ReferenceLibraryPanel: React.FC<{
    references: Reference[];
    onLoad: (reference: Reference) => void;
    onDelete: (id: string) => void;
}> = ({ references, onLoad, onDelete }) => {
    return (
        <div className="h-full overflow-y-auto p-4 bg-gray-800 border border-gray-600 rounded-lg">
            <h2 className="text-2xl font-bold text-emerald-300 mb-6">레퍼런스 라이브러리</h2>
            {references.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>저장된 레퍼런스가 없습니다. 페이지 에디터에서 "레퍼런스로 저장" 버튼을 눌러 추가하세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...references].reverse().map(ref => (
                        <div key={ref.id} className="bg-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden">
                            <img src={ref.thumbnailDataUrl} alt={ref.name} className="w-full h-48 object-cover object-top border-b border-gray-600" />
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-blue-300 truncate">{ref.name}</h3>
                                <p className="text-sm text-gray-400 mt-1 flex-grow">{ref.description}</p>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => onLoad(ref)} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-sm">불러오기</button>
                                    <button onClick={() => onDelete(ref.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md text-sm">삭제</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface ImageFile {
    base64: string;
    mimeType: string;
    dataUrl: string;
}

const JsonFromImageGenerator: React.FC<{
    onJsonGenerated: (json: string) => void;
}> = ({ onJsonGenerated }) => {
    const [image, setImage] = useState<ImageFile | null>(null);
    const [imageName, setImageName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImageName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64String = dataUrl.split(',')[1];
                const mimeType = dataUrl.match(/data:(.*);base64,/)?.[1];
                setImage({ base64: base64String, mimeType: mimeType || 'image/jpeg', dataUrl });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!image) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateJsonFromImage(image.base64, image.mimeType);
            onJsonGenerated(result);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error generating JSON: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 bg-gray-800 border border-gray-600 rounded-b-lg items-center justify-center">
            <div className="w-full max-w-lg">
                 <label
                    htmlFor="json-image-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">Page screenshot (PNG, JPG)</p>
                    </div>
                    <input id="json-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {imageName && <p className="text-center text-sm text-gray-400 mt-2">Selected: {imageName}</p>}
                
                {image && <img src={image.dataUrl} alt="Preview" className="mt-4 max-h-48 rounded-lg border border-gray-600 mx-auto" />}
            </div>

            <button 
                onClick={handleGenerate}
                disabled={!image || isLoading}
                className="mt-6 w-52 h-12 flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-wait text-white font-bold rounded-lg shadow-lg"
            >
                 {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '🖼️ AI로 JSON 생성하기'}
            </button>
            {error && <p className="text-red-400 mt-4 text-center max-w-lg">{error}</p>}
        </div>
    );
};

const ImageEditModal: React.FC<{
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
}> = ({ isOpen, imageSrc, onClose, onGenerate, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    if (!isOpen) return null;

    const handleGenerateClick = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-4xl flex gap-6" onClick={(e) => e.stopPropagation()}>
                <div className="w-1/2 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">원본 이미지</h3>
                    <img src={imageSrc} alt="Image to edit" className="rounded-lg border border-gray-600 w-full object-contain max-h-[60vh]" />
                </div>
                <div className="w-1/2 flex flex-col">
                    <h3 className="text-lg font-semibold text-amber-300 mb-3">AI 이미지 편집</h3>
                    <p className="text-sm text-gray-400 mb-4">AI에게 이미지 편집을 요청하세요. (예: "이미지 속 글자를 지워줘", "강아지에게 산타 모자를 씌워줘")</p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="편집 내용을 입력하세요..."
                        rows={5}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 resize-none focus:ring-amber-500 focus:border-amber-500"
                    />
                    <div className="flex gap-4 mt-auto pt-4">
                        <button onClick={onClose} className="flex-1 h-12 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg">취소</button>
                        <button
                            onClick={handleGenerateClick}
                            disabled={!prompt.trim() || isLoading}
                            className="flex-1 h-12 flex items-center justify-center bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:cursor-wait text-white font-bold rounded-lg"
                        >
                            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '✨ AI로 편집하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


type ActiveMainTab = 'builder' | 'benchmark' | 'knowledge' | 'references';
type ActiveBuilderTab = 'preview' | 'feedback' | 'notes';
type ActiveInputTab = 'html' | 'json' | 'image';

interface EditingImageState {
  visible: boolean;
  src: string;
}

interface EditingGeneratedImageState {
    index: number;
    src: string;
}

/**
 * Fetches a resource and returns its content as a Blob URL.
 * More memory-efficient than Data URLs for binary assets.
 */
const fetchAsBlobUrl = async (url: string): Promise<string> => {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
        // Attempt a fetch without cors for opaque responses, though this has limitations
        const noCorsResponse = await fetch(url, { mode: 'no-cors' });
        if(noCorsResponse.ok || noCorsResponse.type === 'opaque') {
             const blob = await noCorsResponse.blob();
             return URL.createObjectURL(blob);
        }
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

/**
 * Parses CSS text, finds all url() declarations, and replaces them with Blob URLs.
 */
const inlineCssUrls = async (cssText: string, baseUrl: string): Promise<string> => {
    const urlRegex = /url\((['"]?)(.*?)\1\)/g;
    const promises: Promise<void>[] = [];
    const replacements = new Map<string, string>();
    const uniqueUrls = new Set(Array.from(cssText.matchAll(urlRegex), m => m[2]));

    for (const url of uniqueUrls) {
        if (url.startsWith('data:') || url.startsWith('blob:')) {
            continue;
        }
        promises.push((async () => {
            try {
                const absoluteUrl = new URL(url, baseUrl).href;
                const blobUrl = await fetchAsBlobUrl(absoluteUrl);
                replacements.set(url, blobUrl);
            } catch (e) {
                console.warn(`Could not inline CSS resource ${url}:`, e);
            }
        })());
    }

    await Promise.all(promises);

    return cssText.replace(urlRegex, (match, quote, url) => {
        return replacements.has(url) ? `url(${quote}${replacements.get(url)}${quote})` : match;
    });
};


/**
 * A robust function to inline all assets within a given HTML document.
 * This is crucial for html2canvas to avoid "tainted canvas" errors.
 * @param doc The document to process.
 * @param setNotification A function to update the UI with progress.
 */
const inlineAllAssets = async (
    doc: Document,
    setNotification: (notification: { message: string; type: 'info' | 'error' | 'success' } | null) => void
) => {
    // 1. Inline all <img> tags
    setNotification({ message: '이미지 리소스 변환 중... (1/3)', type: 'info' });
    const images = Array.from(doc.querySelectorAll('img'));
    await Promise.all(
      images.map(async (img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
          try {
            img.crossOrigin = 'anonymous';
            const blobUrl = await fetchAsBlobUrl(src);
            img.src = blobUrl;
          } catch (e) {
            console.warn(`Could not inline image ${src}:`, e);
          }
        }
      })
    );
  
    // 2. Inline all <link rel="stylesheet"> and their nested assets (fonts, images)
    setNotification({ message: 'CSS 및 폰트 변환 중... (2/3)', type: 'info' });
    const stylesheets = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
    await Promise.all(
        stylesheets.map(async (sheet) => {
            const href = sheet.getAttribute('href');
            if (href) {
                try {
                    const response = await fetch(href);
                    if (!response.ok) throw new Error(`Failed to fetch stylesheet: ${href}`);
                    let cssText = await response.text();
                    const inlinedCssText = await inlineCssUrls(cssText, href);
                    const style = doc.createElement('style');
                    style.textContent = inlinedCssText;
                    sheet.parentNode?.replaceChild(style, sheet);
                } catch (e) {
                    console.warn(`Could not process stylesheet ${href}:`, e);
                }
            }
        })
    );
    
    // 3. Inline all style attributes with background images
    const elementsWithStyle = Array.from(doc.querySelectorAll<HTMLElement>('[style*="background-image"]'));
    await Promise.all(
      elementsWithStyle.map(async (el) => {
        try {
          const originalStyle = el.style.backgroundImage;
          if (originalStyle && originalStyle.includes('url(')) {
            const inlinedStyle = await inlineCssUrls(originalStyle, doc.location.href);
            el.style.backgroundImage = inlinedStyle;
          }
        } catch(e) {
            console.warn('Could not inline background-image style:', e);
        }
      })
    );
};


export default function App() {
    const [htmlInput, setHtmlInput] = useState<string>(INITIAL_HTML_INPUT);
    const [jsonInput, setJsonInput] = useState<string>(INITIAL_JSON_INPUT);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [previousHtmlInput, setPreviousHtmlInput] = useState<string | null>(null);
    
    const [activeMainTab, setActiveMainTab] = useState<ActiveMainTab>('builder');
    const [activeBuilderTab, setActiveBuilderTab] = useState<ActiveBuilderTab>('preview');
    const [activeInputTab, setActiveInputTab] = useState<ActiveInputTab>('json');

    const [error, setError] = useState<string | null>(null);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const [aiFeedback, setAiFeedback] = useState<DisplaySuggestion[] | null>(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [userNotes, setUserNotes] = useState<string>('');
    
    const [applyingSuggestionIndex, setApplyingSuggestionIndex] = useState<number | null>(null);

    const [isSplitEnabled, setIsSplitEnabled] = useState<boolean>(false);
    const [splitHeight, setSplitHeight] = useState<number>(8000);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [exportScale, setExportScale] = useState<number>(2);

    const [references, setReferences] = useState<Reference[]>([]);
    
    const [isLiveEditEnabled, setIsLiveEditEnabled] = useState<boolean>(false);
    const [isFeedbackModeEnabled, setIsFeedbackModeEnabled] = useState<boolean>(false);

    const [selectedFont, setSelectedFont] = useState<string>(FONT_OPTIONS[0]);

    const [editingImage, setEditingImage] = useState<EditingImageState>({ visible: false, src: '' });
    const [editingGeneratedImage, setEditingGeneratedImage] = useState<EditingGeneratedImageState | null>(null);
    const [isAiEditingImage, setIsAiEditingImage] = useState(false);

    const [isSavingWork, setIsSavingWork] = useState<boolean>(false);
    const [hasSavedData, setHasSavedData] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const [isExpandedView, setIsExpandedView] = useState<boolean>(false);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 4000); // Hide after 4 seconds
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        try {
            const savedReferences = localStorage.getItem('pageReferences');
            if (savedReferences) {
                setReferences(JSON.parse(savedReferences));
            }
        } catch (error) {
            console.error("Failed to load references from localStorage", error);
        }
    }, []);

    const handleUpdatePreview = useCallback(() => {
        setError(null);
        setAiFeedback(null); // Clear previous feedback
        setPreviousHtmlInput(htmlInput);
        setPreviewHtml(htmlInput);
        setActiveBuilderTab('preview'); // Switch to preview after updating
    }, [htmlInput]);
    
    const handleGenerateHtml = useCallback(() => {
        setIsLoading(true);
        setJsonError(null);
        setError(null);
        try {
            const generated = generateHtml(jsonInput, selectedFont);
            setPreviousHtmlInput(htmlInput);
            setHtmlInput(generated);
            setPreviewHtml(generated);
            setActiveBuilderTab('preview');
            setActiveInputTab('html');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during HTML generation.";
            setJsonError(errorMessage);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [jsonInput, htmlInput, selectedFont]);
    
    const loadWorkFromLocal = useCallback(() => {
        try {
            const savedHtml = localStorage.getItem('savedProductPageHTML');
            const savedJson = localStorage.getItem('savedProductPageJSON');
            const savedFont = localStorage.getItem('savedProductPageFont');

            if (savedHtml && savedJson) {
                setHtmlInput(savedHtml);
                setJsonInput(savedJson);
                setPreviewHtml(savedHtml);
                if (savedFont && FONT_OPTIONS.includes(savedFont)) {
                    setSelectedFont(savedFont);
                }
                setNotification({ message: '저장된 작업을 불러왔습니다.', type: 'info' });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to load saved work from localStorage", error);
            setNotification({ message: '저장된 작업 불러오기 실패.', type: 'error' });
            return false;
        }
    }, []);


    useEffect(() => {
        const savedDataExists = !!localStorage.getItem('savedProductPageHTML');
        setHasSavedData(savedDataExists);

        if (savedDataExists) {
            if (window.confirm("저장된 작업이 있습니다. 불러오시겠습니까?")) {
                loadWorkFromLocal();
            } else {
                handleGenerateHtml();
            }
        } else {
            handleGenerateHtml();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    // Automatically regenerate HTML when the font changes
    useEffect(() => {
        if (jsonInput) {
            try {
                const generated = generateHtml(jsonInput, selectedFont);
                setHtmlInput(generated);
                setPreviewHtml(generated);
                setJsonError(null);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during HTML generation.";
                setJsonError(errorMessage);
                console.error(e);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFont]);


    const handleGetFeedback = useCallback(async () => {
        if (!previewHtml) {
            setFeedbackError("Please update the preview first before requesting feedback.");
            setActiveBuilderTab('feedback');
            return;
        }
        setFeedbackError(null);
        setIsFeedbackLoading(true);
        setAiFeedback(null);
        setActiveBuilderTab('feedback');

        try {
            const feedback = await getAiFeedback(previewHtml);
            const displayFeedback: DisplaySuggestion[] = feedback.map(item => {
                if (item.category === '연출 사진 제안') {
                    return { ...item, generationState: 'idle' };
                }
                return item;
            });
            setAiFeedback(displayFeedback);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setFeedbackError(`Error getting AI feedback: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsFeedbackLoading(false);
        }
    }, [previewHtml]);

    const handleApplyMyFeedback = useCallback(async () => {
        if (!userNotes.trim()) {
            alert("Please write some notes first.");
            return;
        }
        setFeedbackError(null);
        setIsFeedbackLoading(true);
        setAiFeedback(null);
        setActiveBuilderTab('feedback');

        try {
            const suggestions = await getAiSuggestionsFromNotes(userNotes, htmlInput);
            setAiFeedback(suggestions);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setFeedbackError(`Error getting AI suggestions from your notes: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsFeedbackLoading(false);
        }
    }, [userNotes, htmlInput]);

    const handleApplySuggestion = useCallback(async (suggestion: string, index: number) => {
        setApplyingSuggestionIndex(index);
        setError(null);
        try {
            setPreviousHtmlInput(htmlInput);
            const newHtml = await applyAiSuggestion(htmlInput, suggestion);
            setHtmlInput(newHtml);
            setPreviewHtml(newHtml);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error applying suggestion: ${errorMessage}`);
            console.error(e);
        } finally {
            setApplyingSuggestionIndex(null);
        }
    }, [htmlInput]);

    const handleUndo = useCallback(() => {
        if (previousHtmlInput !== null) {
            setHtmlInput(previousHtmlInput);
            setPreviewHtml(previousHtmlInput);
            setPreviousHtmlInput(null); // Only allow one level of undo
        }
    }, [previousHtmlInput]);

    const handleExportImage = useCallback(async () => {
        if (!previewHtml) {
            setNotification({ message: '미리보기 할 내용이 없습니다.', type: 'error' });
            return;
        }
    
        setIsExporting(true);
        setNotification({ message: '이미지 내보내기를 시작합니다...', type: 'info' });
    
        const tempIframe = document.createElement('iframe');
    
        try {
            // Step 1: Render the HTML in an off-screen iframe to get a live DOM.
            tempIframe.style.position = 'absolute';
            tempIframe.style.left = '-9999px';
            const previewIframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
            const width = previewIframe ? previewIframe.clientWidth : 1200;
            tempIframe.style.width = `${width}px`;
            tempIframe.style.height = '1000px';
            
            document.body.appendChild(tempIframe);
            
            // Using srcdoc to inject content
            tempIframe.srcdoc = previewHtml;
            await new Promise<void>((resolve, reject) => {
                let resolved = false;
                const timeout = setTimeout(() => {
                    if (!resolved) reject(new Error("Iframe load timed out after 10 seconds"));
                }, 10000);
                tempIframe.onload = () => {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve();
                };
            });
    
            // Step 2: Inline all assets within the iframe's document.
            if (!tempIframe.contentDocument) {
                throw new Error("Temporary iframe content document not available.");
            }
            await inlineAllAssets(tempIframe.contentDocument, setNotification);
            
            // Allow some time for fonts and images to fully render after inlining
            await new Promise(resolve => setTimeout(resolve, 500));
    
            // Step 3: Capture the now "clean" iframe content.
            setNotification({ message: '페이지를 캡처합니다... (3/3)', type: 'info' });
            const elementToCapture = tempIframe.contentDocument.documentElement;
            const canvas = await html2canvas(elementToCapture, {
                useCORS: true,
                allowTaint: false,
                backgroundColor: null,
                scale: exportScale,
                imageTimeout: 0,
            });
            const dataUrl = canvas.toDataURL('image/png');
    
            // Step 4: Process and download the final image(s).
            if (!isSplitEnabled) {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'detail_page_capture.png';
                link.click();
            } else {
                 const img = new Image();
                const zip = new JSZip();

                const imgLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = dataUrl;
                });
                
                const loadedImage = await imgLoadPromise;
                
                const totalHeight = loadedImage.height;
                const sliceHeight = splitHeight > 0 ? splitHeight : 8000;
                let y = 0;
                let i = 1;

                while (y < totalHeight) {
                    const height = Math.min(sliceHeight, totalHeight - y);
                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = loadedImage.width;
                    sliceCanvas.height = height;
                    const ctx = sliceCanvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(loadedImage, 0, y, loadedImage.width, height, 0, 0, loadedImage.width, height);
                        const sliceDataUrl = sliceCanvas.toDataURL('image/png');
                        const blob = await (await fetch(sliceDataUrl)).blob();
                        zip.file(`image_${i}.png`, blob);
                    }
                    y += sliceHeight;
                    i++;
                }

                const content = await zip.generateAsync({ type: "blob" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'detail_page_captures.zip';
                link.click();
            }
            setNotification({ message: '이미지 저장이 완료되었습니다!', type: 'success' });
        } catch (err) {
            console.error('Error exporting image:', err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setNotification({ message: `이미지 내보내기 실패: ${errorMessage}`, type: 'error' });
        } finally {
            setIsExporting(false);
            if (tempIframe.parentNode) {
                tempIframe.parentNode.removeChild(tempIframe);
            }
        }
    }, [previewHtml, isSplitEnabled, splitHeight, exportScale]);

    const handleSaveWorkToLocal = useCallback(() => {
        setIsSavingWork(true);
        setNotification(null);
        try {
            localStorage.setItem('savedProductPageHTML', htmlInput);
            localStorage.setItem('savedProductPageJSON', jsonInput);
            localStorage.setItem('savedProductPageFont', selectedFont);
            setHasSavedData(true);
            setNotification({ message: '현재 작업을 브라우저에 저장했습니다!', type: 'success' });
        } catch (err) {
            console.error('Error saving work to localStorage:', err);
            const errorMessage = err instanceof Error && err.name === 'QuotaExceededError' 
                ? '브라우저 저장 공간이 부족합니다.' 
                : '알 수 없는 오류가 발생했습니다.';
            setNotification({ message: `작업 저장 실패: ${errorMessage}`, type: 'error' });
        } finally {
            setIsSavingWork(false);
        }
    }, [htmlInput, jsonInput, selectedFont]);

    const handleClearSavedWork = useCallback(() => {
        if (window.confirm("정말로 저장된 작업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            try {
                localStorage.removeItem('savedProductPageHTML');
                localStorage.removeItem('savedProductPageJSON');
                localStorage.removeItem('savedProductPageFont');
                setHasSavedData(false);
                setNotification({ message: '저장된 데이터가 삭제되었습니다.', type: 'info' });
            } catch (err) {
                 console.error('Error clearing saved work from localStorage:', err);
                 setNotification({ message: '데이터 삭제 실패.', type: 'error' });
            }
        }
    }, []);
    
    const handleLoadReference = (reference: Reference) => {
        if (window.confirm("현재 작업 내용이 사라집니다. 레퍼런스를 불러오시겠습니까? (This will replace your current work. Load reference?)")) {
            setHtmlInput(reference.html);
            setJsonInput(reference.json);
            setPreviewHtml(reference.html);
            setActiveMainTab('builder');
            setActiveInputTab('html');
            setActiveBuilderTab('preview');
        }
    };

    const handleDeleteReference = (id: string) => {
        if (window.confirm("정말로 이 레퍼런스를 삭제하시겠습니까? (Are you sure you want to delete this reference?)")) {
            const updatedReferences = references.filter(ref => ref.id !== id);
            setReferences(updatedReferences);
            localStorage.setItem('pageReferences', JSON.stringify(updatedReferences));
        }
    };

    const urlToBase64 = useCallback((url: string): Promise<{ base64: string; mimeType: string; }> => {
        return new Promise((resolve, reject) => {
            if (url.startsWith('data:')) {
                 const parts = url.split(',');
                 const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
                 resolve({ base64: parts[1], mimeType });
                 return;
            }

            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context.'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png'); 
                resolve({
                    base64: dataURL.split(',')[1],
                    mimeType: 'image/png'
                });
            };
            img.onerror = (error) => {
                console.error("Error loading image for Base64 conversion:", error);
                reject(new Error('Failed to load image for Base64 conversion. Check CORS policy.'));
            };
            img.src = url;
        });
    }, []);
    
    const handleApplyInPlaceImageEdit = useCallback(async (prompt: string) => {
        setIsAiEditingImage(true);
        setError(null);
        try {
            const { base64, mimeType } = await urlToBase64(editingImage.src);
            const editedBase64 = await editImageWithAi(base64, mimeType, prompt);
            const newDataUrl = `data:image/png;base64,${editedBase64}`;

            setPreviousHtmlInput(htmlInput);
            const newHtml = htmlInput.replace(editingImage.src, newDataUrl);
            setHtmlInput(newHtml);
            setPreviewHtml(newHtml);
            setEditingImage({ visible: false, src: '' });

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error editing image: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsAiEditingImage(false);
        }
    }, [editingImage.src, htmlInput, urlToBase64]);

    const handleGenerateAiImage = useCallback(async (suggestion: string, index: number) => {
        setApplyingSuggestionIndex(index);
        setAiFeedback(prev => {
            if (!prev) return null;
            const newFeedback = [...prev];
            newFeedback[index] = { ...newFeedback[index], generationState: 'loading', generationError: undefined };
            return newFeedback;
        });

        try {
            const base64Bytes = await generateImageFromSuggestion(suggestion);
            const imageUrl = `data:image/png;base64,${base64Bytes}`;
            setAiFeedback(prev => {
                if (!prev) return null;
                const newFeedback = [...prev];
                newFeedback[index] = { ...newFeedback[index], generationState: 'done', generatedImage: imageUrl };
                return newFeedback;
            });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setAiFeedback(prev => {
                if (!prev) return null;
                const newFeedback = [...prev];
                newFeedback[index] = { ...newFeedback[index], generationState: 'error', generationError: errorMessage };
                return newFeedback;
            });
        } finally {
            setApplyingSuggestionIndex(null);
        }
    }, []);

    const handleInsertGeneratedImage = useCallback(async (suggestion: string, index: number, generatedImage: string) => {
        setApplyingSuggestionIndex(index);
        setError(null);
        try {
            setPreviousHtmlInput(htmlInput);
            const newHtml = await insertImageIntoHtml(htmlInput, generatedImage, suggestion);
            setHtmlInput(newHtml);
            setPreviewHtml(newHtml);
            setAiFeedback(prev => (prev || []).filter((_, i) => i !== index));
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error applying image suggestion: ${errorMessage}`);
            console.error(e);
        } finally {
            setApplyingSuggestionIndex(null);
        }
    }, [htmlInput]);

    const handleApplyGeneratedImageEdit = useCallback(async (prompt: string) => {
        if (!editingGeneratedImage) return;

        setIsAiEditingImage(true);
        setError(null);
        try {
            const { base64, mimeType } = await urlToBase64(editingGeneratedImage.src);
            const editedBase64 = await editImageWithAi(base64, mimeType, prompt);
            const newDataUrl = `data:image/png;base64,${editedBase64}`;
            
            setAiFeedback(prev => {
                if (!prev) return null;
                const newFeedback = [...prev];
                const index = editingGeneratedImage.index;
                newFeedback[index] = { ...newFeedback[index], generatedImage: newDataUrl };
                return newFeedback;
            });
            
            setEditingImage({ visible: false, src: ''});
            setEditingGeneratedImage(null);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error editing generated image: ${errorMessage}`);
            setEditingImage({ visible: false, src: ''});
            setEditingGeneratedImage(null);
        } finally {
            setIsAiEditingImage(false);
        }
    }, [editingGeneratedImage, urlToBase64]);


    const MainTabButton: React.FC<{ tabName: ActiveMainTab; children: React.ReactNode }> = ({ tabName, children }) => (
        <button
            onClick={() => setActiveMainTab(tabName)}
            className={`px-6 py-2 text-lg font-semibold rounded-md transition-colors ${activeMainTab === tabName ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
            {children}
        </button>
    );
    
    const InputTabButton: React.FC<{ tabName: ActiveInputTab; children: React.ReactNode }> = ({ tabName, children }) => (
        <button
            onClick={() => {
                setActiveInputTab(tabName);
                setError(null);
                setJsonError(null);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeInputTab === tabName ? 'bg-gray-800 border-gray-600 border-b-0 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
            {children}
        </button>
    );

    const BuilderTabButton: React.FC<{ tabName: ActiveBuilderTab; children: React.ReactNode }> = ({ tabName, children }) => (
        <button
            onClick={() => setActiveBuilderTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeBuilderTab === tabName ? 'bg-gray-800 border-gray-600 border-b-0 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
        >
            {children}
        </button>
    );

    const renderBuilder = () => (
         <main className="flex-grow grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch h-[calc(100vh-230px)] mt-6">
            <div className={`flex flex-col h-full min-w-0 ${isExpandedView ? 'hidden' : ''}`}>
                <div className="flex border-b border-gray-600">
                    <InputTabButton tabName="json">{`{} JSON으로 생성`}</InputTabButton>
                    <InputTabButton tabName="image">{`🖼️ 이미지로 JSON 생성`}</InputTabButton>
                    <InputTabButton tabName="html">{'</> HTML 직접 입력'}</InputTabButton>
                </div>
                <div className="flex-grow mt-[-1px]">
                    {activeInputTab === 'html' && (
                        <CodeInput
                            id="html-input"
                            label="상세페이지 HTML 입력 (Input)"
                            value={htmlInput}
                            onChange={setHtmlInput}
                            hasError={!!error}
                            placeholder="Paste your page HTML here..."
                        />
                    )}
                    {activeInputTab === 'json' && (
                         <CodeInput
                            id="json-input"
                            label="상세페이지 JSON 입력 (Input)"
                            value={jsonInput}
                            onChange={setJsonInput}
                            hasError={!!jsonError}
                            placeholder="Paste your page generation plan here..."
                        />
                    )}
                    {activeInputTab === 'image' && (
                        <JsonFromImageGenerator 
                            onJsonGenerated={(json) => {
                                setJsonInput(json);
                                setActiveInputTab('json');
                            }}
                        />
                    )}
                </div>
            </div>

            <div className={`flex-col items-center justify-center space-y-4 ${isExpandedView ? 'hidden' : 'flex'}`}>
                {activeInputTab === 'html' ? (
                    <button
                        onClick={handleUpdatePreview}
                        disabled={isLoading}
                        className="w-48 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '▶ 미리보기 업데이트'}
                    </button>
                ) : (
                    <button
                        onClick={handleGenerateHtml}
                        disabled={isLoading || activeInputTab === 'image'}
                        className="w-48 h-12 flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '▶ HTML 생성하기'}
                    </button>
                )}

                <button
                    onClick={handleUndo}
                    disabled={previousHtmlInput === null || activeInputTab === 'image'}
                    className="w-48 h-12 flex items-center justify-center bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                    ⏪ 되돌리기
                </button>
                <button
                    onClick={handleGetFeedback}
                    disabled={isFeedbackLoading || !previewHtml}
                    className="w-48 h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-wait text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                    {isFeedbackLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '🤖 AI 마케팅 피드백'}
                </button>
                {error && <div className="text-red-400 text-xs text-center max-w-xs">{error}</div>}
                {jsonError && <div className="text-red-400 text-xs text-center max-w-xs">{jsonError}</div>}
            </div>

            <div className={`flex flex-col h-full min-w-0 ${isExpandedView ? 'md:col-span-3' : ''}`}>
                <div className="flex border-b border-gray-600 items-center">
                    <BuilderTabButton tabName="preview">Preview</BuilderTabButton>
                    <BuilderTabButton tabName="feedback">AI 피드백</BuilderTabButton>
                    <BuilderTabButton tabName="notes">내 피드백</BuilderTabButton>
                     <div className="ml-auto flex items-center pr-4">
                        <label htmlFor="live-edit-toggle" className="flex items-center cursor-pointer">
                            <span className="mr-3 text-sm font-medium text-gray-300">라이브 편집</span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id="live-edit-toggle" 
                                    className="sr-only peer" 
                                    checked={isLiveEditEnabled}
                                    onChange={() => {
                                        const newMode = !isLiveEditEnabled;
                                        setIsLiveEditEnabled(newMode);
                                        if (newMode) setIsFeedbackModeEnabled(false);
                                    }} 
                                />
                                <div className="w-14 h-8 bg-gray-600 rounded-full peer-checked:bg-blue-600"></div>
                                <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full"></div>
                            </div>
                        </label>
                         <label htmlFor="feedback-mode-toggle" className="flex items-center cursor-pointer ml-4">
                            <span className="mr-3 text-sm font-medium text-gray-300">요소 피드백</span>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id="feedback-mode-toggle" 
                                    className="sr-only peer" 
                                    checked={isFeedbackModeEnabled}
                                    onChange={() => {
                                        const newMode = !isFeedbackModeEnabled;
                                        setIsFeedbackModeEnabled(newMode);
                                        if (newMode) setIsLiveEditEnabled(false);
                                    }} 
                                />
                                <div className="w-14 h-8 bg-gray-600 rounded-full peer-checked:bg-green-600"></div>
                                <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full"></div>
                            </div>
                        </label>
                    </div>
                </div>
                <div className="flex-grow mt-[-1px]">
                   {activeBuilderTab === 'preview' && <PreviewPanel 
                        html={previewHtml}
                        isLiveEditEnabled={isLiveEditEnabled}
                        isFeedbackModeEnabled={isFeedbackModeEnabled}
                        onHtmlChange={(newHtml) => {
                           setHtmlInput(newHtml);
                           setPreviewHtml(newHtml);
                        }}
                        onElementFeedback={(feedback) => {
                            setUserNotes(prev => `${prev}\n${feedback}`.trim());
                            setActiveBuilderTab('notes');
                        }}
                        onImageFeedback={(src) => {
                            setEditingGeneratedImage(null); // Ensure only one edit mode is active
                            setEditingImage({ visible: true, src: src });
                        }}
                    />}
                   {activeBuilderTab === 'feedback' && <AiFeedbackPanel 
                        feedback={aiFeedback} 
                        isLoading={isFeedbackLoading} 
                        error={feedbackError} 
                        onApplySuggestion={handleApplySuggestion}
                        onGenerateImage={handleGenerateAiImage}
                        onInsertGeneratedImage={handleInsertGeneratedImage}
                        onEditGeneratedImage={(index, src) => {
                            setEditingImage({ visible: true, src });
                            setEditingGeneratedImage({ index, src });
                        }}
                        applyingSuggestionIndex={applyingSuggestionIndex}
                    />}
                   {activeBuilderTab === 'notes' && <UserFeedbackPanel notes={userNotes} onChange={setUserNotes} onApply={handleApplyMyFeedback} isApplying={isFeedbackLoading} />}
                </div>
            </div>
        </main>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8">
            {notification && (
                <div 
                    className={`fixed bottom-8 right-8 p-4 rounded-lg shadow-xl text-white z-[100] transition-opacity duration-300 ${
                        notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                >
                    {notification.message}
                </div>
            )}
            <ImageEditModal
                isOpen={editingImage.visible}
                imageSrc={editingImage.src}
                onClose={() => {
                    setEditingImage({ visible: false, src: '' });
                    setEditingGeneratedImage(null);
                }}
                onGenerate={editingGeneratedImage ? handleApplyGeneratedImageEdit : handleApplyInPlaceImageEdit}
                isLoading={isAiEditingImage}
            />
            <header className="flex justify-between items-center mb-6">
                <div className="text-left">
                     <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        상세페이지 피드백 스튜디오
                    </h1>
                    <p className="text-gray-400 mt-2">Get instant AI-powered feedback to improve your product detail pages.</p>
                </div>
                {activeMainTab === 'builder' && (
                    <div className="flex items-center gap-4 flex-wrap justify-end">
                        <button
                            onClick={() => setIsExpandedView(!isExpandedView)}
                            className="px-4 py-2 flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg"
                            title={isExpandedView ? "에디터로 돌아가기" : "미리보기 확대"}
                        >
                            {isExpandedView ? <CollapseIcon /> : <ExpandIcon />}
                            <span className="ml-2 hidden md:inline">{isExpandedView ? "기본 보기" : "확대 보기"}</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <label htmlFor="font-selector" className="text-sm text-gray-300 whitespace-nowrap">글꼴:</label>
                            <select
                                id="font-selector"
                                value={selectedFont}
                                onChange={(e) => setSelectedFont(e.target.value)}
                                className="w-40 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
                            >
                                {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                            </select>
                        </div>

                        <div className="bg-gray-700 p-1 rounded-lg flex items-center gap-1">
                            <button
                                onClick={handleSaveWorkToLocal}
                                disabled={isSavingWork}
                                className="px-3 py-1 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold rounded-md shadow-md text-sm"
                            >
                                 {isSavingWork ? '저장 중...' : '💾 현재 작업 저장'}
                            </button>
                             <button
                                onClick={loadWorkFromLocal}
                                disabled={!hasSavedData}
                                className="px-3 py-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold rounded-md shadow-md text-sm"
                            >
                                <LoadIcon /> <span className="ml-1.5">불러오기</span>
                            </button>
                             <button
                                onClick={handleClearSavedWork}
                                disabled={!hasSavedData}
                                className="px-3 py-1 flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold rounded-md shadow-md text-sm"
                            >
                                <ClearIcon /> <span className="ml-1.5">초기화</span>
                            </button>
                        </div>

                        <div className="bg-gray-700 p-2 rounded-lg flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="split-image-checkbox"
                                    checked={isSplitEnabled}
                                    onChange={(e) => setIsSplitEnabled(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-500 rounded focus:ring-indigo-500"
                                />