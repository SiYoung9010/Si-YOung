import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { getAiFeedback, getAiSuggestionsFromNotes, applyAiSuggestion, generateJsonFromImage, insertImageIntoPlan, editImageWithAi, generateImageFromSuggestion, generateJsonFromHtml } from './services/aiService';
import { generateHtml } from './services/htmlGenerator';
import { INITIAL_JSON_INPUT, INITIAL_HTML_INPUT } from './constants';
import type { AiSuggestion, ProductPlan, Block } from './types';

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

const MaximizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 0 .707l4.096 4.096H11.5a.5.5 0 0 0 0 1h3.975a.5.5 0 0 0 .5-.5V7.5a.5.5 0 0 0-1 0v2.768l-4.096-4.096a.5.5 0 0 0-.707 0zM1.025 5.828a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 0 0 1 0V.525a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 5.121a.5.5 0 0 0 0 .707zm13.95 0a.5.5 0 0 0 0-.707L10.879.172H13.5a.5.5 0 0 0 0-1H9.525a.5.5 0 0 0-.5.5V4.5a.5.5 0 0 0 1 0V1.732l4.096 4.096a.5.5 0 0 0 .707 0z"/>
    </svg>
);

const MinimizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM10.172 5.828a.5.5 0 0 0 0-.707L6.075.172H8.5a.5.5 0 0 0 0-1H4.525a.5.5 0 0 0-.5.5V4.5a.5.5 0 0 0 1 0V1.732l4.096 4.096a.5.5 0 0 0 .707 0zm.707-5.656a.5.5 0 0 0-.707 0L6.075 4.268V1.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H9.5a.5.5 0 0 0 0-1H6.732l4.096-4.096a.5.5 0 0 0 0-.707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768l4.096-4.096a.5.5 0 0 0 0-.707z"/>
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
    isFeedbackModeEnabled: boolean;
    onElementFeedback: (feedback: string) => void;
    onImageFeedback: (src: string) => void;
    onImageClick: (src: string) => void;
}> = ({ html, isFeedbackModeEnabled, onElementFeedback, onImageFeedback, onImageClick }) => {
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

        const feedbackClickHandler = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            removeHighlight();
            const target = e.target as HTMLElement;
            if (!target || target.tagName === 'BODY' || target.tagName === 'HTML') return;

            if (target.tagName === 'IMG') {
                onImageFeedback((target as HTMLImageElement).src);
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
        
        const setupIframe = () => {
            if (!iframe.contentWindow || !iframe.contentDocument) return;
            const doc = iframe.contentDocument;
            if (!doc?.body) return;
            
            // Cleanup listeners from previous renders
            if ((doc.body as any)._feedbackListeners) {
                doc.body.removeEventListener('mouseover', (doc.body as any)._feedbackMouseover);
                doc.body.removeEventListener('mouseout', (doc.body as any)._feedbackMouseout);
                doc.body.removeEventListener('click', (doc.body as any)._feedbackClick);
                (doc.body as any)._feedbackListeners = false;
            }
            if ((doc.body as any)._viewImageClick) {
                 doc.body.removeEventListener('click', (doc.body as any)._viewImageClick);
            }
             Array.from(doc.querySelectorAll('img')).forEach(img => img.style.cursor = 'default');

            // Visual indicators for modes
            let outlineStyle = 'none';
            if (isFeedbackModeEnabled) outlineStyle = '2px solid #16a34a';
            doc.documentElement.style.outline = outlineStyle;
            doc.documentElement.style.outlineOffset = '-2px';
            
            // Manage event listeners based on mode
            if (isFeedbackModeEnabled) {
                doc.body.style.cursor = 'crosshair';
                (doc.body as any)._feedbackMouseover = mouseoverHandler;
                (doc.body as any)._feedbackMouseout = removeHighlight;
                (doc.body as any)._feedbackClick = feedbackClickHandler;
                (doc.body as any)._feedbackListeners = true;
                doc.body.addEventListener('mouseover', mouseoverHandler);
                doc.body.addEventListener('mouseout', removeHighlight);
                doc.body.addEventListener('click', feedbackClickHandler);
            } else {
                 doc.body.style.cursor = 'default';
                 const viewImageClickHandler = (e: MouseEvent) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'IMG') {
                        e.preventDefault();
                        e.stopPropagation();
                        onImageClick((target as HTMLImageElement).src);
                    }
                };
                (doc.body as any)._viewImageClick = viewImageClickHandler;
                doc.body.addEventListener('click', viewImageClickHandler);
                Array.from(doc.querySelectorAll('img')).forEach(img => img.style.cursor = 'zoom-in');
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
                 if ((doc.body as any)._feedbackListeners) {
                    doc.body.removeEventListener('mouseover', (doc.body as any)._feedbackMouseover);
                    doc.body.removeEventListener('mouseout', (doc.body as any)._feedbackMouseout);
                    doc.body.removeEventListener('click', (doc.body as any)._feedbackClick);
                 }
                 if ((doc.body as any)._viewImageClick) doc.body.removeEventListener('click', (doc.body as any)._viewImageClick);
            }
            if (iframe) {
                iframe.onload = null;
            }
        };
    }, [html, isFeedbackModeEnabled, onElementFeedback, onImageFeedback, onImageClick]);

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

const ImageFullScreenModal: React.FC<{ src: string; onClose: () => void; }> = ({ src, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]"
            onClick={onClose}
        >
            <button 
                className="absolute top-4 right-4 text-white text-5xl font-bold"
                onClick={onClose}
                aria-label="Close full screen image view"
            >
                &times;
            </button>
            <img 
                src={src} 
                alt="Full screen view" 
                className="max-w-[95vw] max-h-[95vh] object-contain"
                onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking image
            />
        </div>
    );
};


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

const fetchAsBlobUrl = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`CORS fetch failed: ${response.statusText}`);
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        console.warn(`CORS fetch for ${url} failed, trying proxy. Error: ${e}`);
        // Fallback to a simple proxy if CORS fails
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        try {
            const response = await fetch(proxyUrl);
             if (!response.ok) {
                throw new Error(`Proxy fetch failed: ${response.statusText}`);
            }
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (proxyErr) {
            console.error(`Proxy fetch also failed for ${url}:`, proxyErr);
            throw new Error(`Failed to fetch ${url} with and without proxy.`);
        }
    }
};

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


const inlineAllAssets = async (
    doc: Document,
    setNotification: (notification: { message: string; type: 'info' | 'error' | 'success' } | null) => void
) => {
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

const recursiveFindAndReplace = (obj: any, oldSrc: string, newSrc: string): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => recursiveFindAndReplace(item, oldSrc, newSrc));
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if ((key === 'src' || key === 'imgSrc' || key === 'videoUrl') && obj[key] === oldSrc) {
                newObj[key] = newSrc;
            } else {
                newObj[key] = recursiveFindAndReplace(obj[key], oldSrc, newSrc);
            }
        }
    }
    return newObj;
};


export default function App() {
    const [pagePlan, setPagePlan] = useState<ProductPlan | null>(null);
    const [jsonInput, setJsonInput] = useState<string>('');
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [previousPagePlan, setPreviousPagePlan] = useState<ProductPlan | null>(null);
    const [htmlForJsonConversion, setHtmlForJsonConversion] = useState<string>(INITIAL_HTML_INPUT);
    
    const [activeBuilderTab, setActiveBuilderTab] = useState<ActiveBuilderTab>('preview');
    const [activeInputTab, setActiveInputTab] = useState<ActiveInputTab>('html');

    const [error, setError] = useState<string | null>(null);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    
    const [aiFeedback, setAiFeedback] = useState<DisplaySuggestion[] | null>(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [userNotes, setUserNotes] = useState<string>('');
    
    const [applyingSuggestionIndex, setApplyingSuggestionIndex] = useState<number | null>(null);

    const [isSplitEnabled, setIsSplitEnabled] = useState<boolean>(false);
    const [splitHeight, setSplitHeight] = useState<number>(8000);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [exportScale, setExportScale] = useState<number>(2);
    
    const [isFeedbackModeEnabled, setIsFeedbackModeEnabled] = useState<boolean>(false);

    const [selectedFont, setSelectedFont] = useState<string>(FONT_OPTIONS[0]);

    const [editingImage, setEditingImage] = useState<EditingImageState>({ visible: false, src: '' });
    const [editingGeneratedImage, setEditingGeneratedImage] = useState<EditingGeneratedImageState | null>(null);
    const [isAiEditingImage, setIsAiEditingImage] = useState(false);
    
    const [fullScreenImageSrc, setFullScreenImageSrc] = useState<string | null>(null);
    const [isPreviewMaximized, setIsPreviewMaximized] = useState<boolean>(false);

    const [isSavingWork, setIsSavingWork] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Main effect to load initial data from localStorage or constants
    useEffect(() => {
        try {
            const savedJson = localStorage.getItem('savedProductPageJSON');
            const savedFont = localStorage.getItem('savedProductPageFont');
            
            if (savedJson) {
                setJsonInput(savedJson);
                setTimeout(() => setNotification({ message: '저장된 작업을 불러왔습니다.', type: 'info' }), 100);
                setActiveInputTab('json');
            } else {
                setJsonInput(INITIAL_JSON_INPUT);
                setHtmlForJsonConversion(INITIAL_HTML_INPUT);
            }
            
            if (savedFont && FONT_OPTIONS.includes(savedFont)) {
                setSelectedFont(savedFont);
            }
        } catch (error) {
            console.error("Failed to load or parse initial JSON", error);
            setJsonInput(INITIAL_JSON_INPUT);
            setHtmlForJsonConversion(INITIAL_HTML_INPUT);
            setJsonError("저장된 작업 파일을 불러오는데 실패했습니다.");
        }
    },[]);

    // Effect to sync editor content (jsonInput) to the pagePlan object
    useEffect(() => {
        if (!jsonInput) {
            setPagePlan(null);
            setJsonError(null);
            return;
        };

        try {
            const parsedPlan = JSON.parse(jsonInput);
            setPagePlan(parsedPlan);
            setJsonError(null);
        } catch (e) {
            if (e instanceof SyntaxError) {
                setJsonError(`JSON 포맷 오류: ${e.message}`);
            }
        }
    }, [jsonInput]);
    
    // Effect to generate HTML whenever the plan or font changes
    useEffect(() => {
        if (pagePlan) {
            try {
                const generated = generateHtml(pagePlan, selectedFont);
                setPreviewHtml(generated);
            } catch(e) {
                console.error("Error generating HTML from plan", e);
                setPreviewHtml(`<div style="color: red; padding: 20px;">Error generating preview: ${e instanceof Error ? e.message : 'Unknown error'}</div>`);
            }
        } else {
            setPreviewHtml('');
        }
    }, [pagePlan, selectedFont]);


    const handleGetFeedback = useCallback(async () => {
        if (!previewHtml) {
            setFeedbackError("Please generate a preview first before requesting feedback.");
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
        if (!userNotes.trim() || !pagePlan) {
            alert("Please write some notes first.");
            return;
        }
        setFeedbackError(null);
        setIsFeedbackLoading(true);
        setAiFeedback(null);
        setActiveBuilderTab('feedback');

        try {
            const suggestions = await getAiSuggestionsFromNotes(userNotes, pagePlan);
            setAiFeedback(suggestions);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setFeedbackError(`Error getting AI suggestions from your notes: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsFeedbackLoading(false);
        }
    }, [userNotes, pagePlan]);

    const handleApplySuggestion = useCallback(async (suggestion: string, index: number) => {
        if (!pagePlan) return;
        setApplyingSuggestionIndex(index);
        setError(null);
        try {
            setPreviousPagePlan(pagePlan);
            const newPlan = await applyAiSuggestion(pagePlan, suggestion);
            setPagePlan(newPlan);
            setJsonInput(JSON.stringify(newPlan, null, 2));
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error applying suggestion: ${errorMessage}`);
            console.error(e);
        } finally {
            setApplyingSuggestionIndex(null);
        }
    }, [pagePlan]);

    const handleGenerateJsonFromHtml = useCallback(async () => {
        setIsConverting(true);
        setError(null);
        setJsonError(null);
        try {
            const jsonString = await generateJsonFromHtml(htmlForJsonConversion);
            setJsonInput(jsonString); // This will trigger the useEffect to update pagePlan
            setActiveInputTab('json');
            setNotification({ message: 'HTML이 JSON으로 성공적으로 변환되었습니다!', type: 'success' });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during JSON generation from HTML.";
            setError(errorMessage);
            console.error(e);
        } finally {
            setIsConverting(false);
        }
    }, [htmlForJsonConversion]);

    const handleUndo = useCallback(() => {
        if (previousPagePlan !== null) {
            setPagePlan(previousPagePlan);
            setJsonInput(JSON.stringify(previousPagePlan, null, 2));
            setPreviousPagePlan(null);
        }
    }, [previousPagePlan]);

    const handleExportImage = useCallback(async () => {
        if (!previewHtml) {
            setNotification({ message: '미리보기 할 내용이 없습니다.', type: 'error' });
            return;
        }
    
        setIsExporting(true);
        setNotification({ message: '이미지 내보내기를 시작합니다...', type: 'info' });
    
        const tempIframe = document.createElement('iframe');
    
        try {
            tempIframe.style.position = 'absolute';
            tempIframe.style.left = '-9999px';
            const previewIframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
            const width = previewIframe ? previewIframe.clientWidth : 1200;
            tempIframe.style.width = `${width}px`;
            tempIframe.style.height = '1000px';
            
            document.body.appendChild(tempIframe);
            
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
    
            if (!tempIframe.contentDocument) {
                throw new Error("Temporary iframe content document not available.");
            }
            await inlineAllAssets(tempIframe.contentDocument, setNotification);
            
            await new Promise(resolve => setTimeout(resolve, 500));
    
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
        if (!pagePlan) return;
        setIsSavingWork(true);
        setNotification(null);
        try {
            localStorage.setItem('savedProductPageJSON', JSON.stringify(pagePlan, null, 2));
            localStorage.setItem('savedProductPageFont', selectedFont);
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
    }, [pagePlan, selectedFont]);
    
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
        if (!pagePlan) return;
        setIsAiEditingImage(true);
        setError(null);
        try {
            const { base64, mimeType } = await urlToBase64(editingImage.src);
            const editedBase64 = await editImageWithAi(base64, mimeType, prompt);
            const newDataUrl = `data:image/png;base64,${editedBase64}`;

            setPreviousPagePlan(pagePlan);
            const newPlan = recursiveFindAndReplace(pagePlan, editingImage.src, newDataUrl);
            
            setPagePlan(newPlan);
            setJsonInput(JSON.stringify(newPlan, null, 2));

            setEditingImage({ visible: false, src: '' });

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error editing image: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsAiEditingImage(false);
        }
    }, [editingImage.src, pagePlan, urlToBase64]);

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
        if (!pagePlan) return;
        setApplyingSuggestionIndex(index);
        setError(null);
        try {
            const { base64 } = await urlToBase64(generatedImage);
            setPreviousPagePlan(pagePlan);
            const newPlan = await insertImageIntoPlan(pagePlan, base64, suggestion);
            setPagePlan(newPlan);
            setJsonInput(JSON.stringify(newPlan, null, 2));
            setAiFeedback(prev => (prev || []).filter((_, i) => i !== index));
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
            setError(`Error applying image suggestion: ${errorMessage}`);
            console.error(e);
        } finally {
            setApplyingSuggestionIndex(null);
        }
    }, [pagePlan, urlToBase64]);

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
            {fullScreenImageSrc && <ImageFullScreenModal src={fullScreenImageSrc} onClose={() => setFullScreenImageSrc(null)} />}
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
            <header className={`flex justify-between items-center mb-6 ${isPreviewMaximized ? 'hidden' : ''}`}>
                <div className="text-left">
                     <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        상세페이지 피드백 스튜디오
                    </h1>
                    <p className="text-gray-400 mt-2">AI 기반 피드백으로 상세 페이지를 개선하세요.</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-end">
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
                    <button
                        onClick={handleSaveWorkToLocal}
                        disabled={!pagePlan || isSavingWork}
                        className="px-4 py-2 flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg"
                    >
                         {isSavingWork ? '저장 중...' : '💾 현재 작업 저장'}
                    </button>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="split-image-checkbox"
                            checked={isSplitEnabled}
                            onChange={(e) => setIsSplitEnabled(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-500 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="split-image-checkbox" className="text-sm text-gray-300 whitespace-nowrap">이미지 분할 저장</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="split-height-input" className="text-sm text-gray-300 whitespace-nowrap">분할 높이(px):</label>
                        <input 
                            type="number" 
                            id="split-height-input"
                            value={splitHeight}
                            onChange={(e) => setSplitHeight(Number(e.target.value))}
                            disabled={!isSplitEnabled}
                            className="w-24 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5 disabled:opacity-50"
                        />
                    </div>
                     <div className="flex items-center gap-2">
                        <label htmlFor="export-scale-selector" className="text-sm text-gray-300 whitespace-nowrap">화질:</label>
                        <select
                            id="export-scale-selector"
                            value={exportScale}
                            onChange={(e) => setExportScale(Number(e.target.value))}
                            className="w-28 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
                        >
                            <option value="1">1x (표준)</option>
                            <option value="2">2x (고화질)</option>
                            <option value="3">3x (초고화질)</option>
                        </select>
                    </div>
                     <button
                        onClick={handleExportImage}
                        disabled={!previewHtml || isExporting}
                        className="px-4 py-2 w-36 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                        {isExporting ? '저장 중...' : '이미지로 저장'}
                    </button>
                </div>
            </header>

            <main className={`flex-grow grid grid-cols-1 ${isPreviewMaximized ? '' : 'md:grid-cols-[1fr_auto_1fr] gap-6'} items-stretch`}>
                <div className={`flex flex-col h-full min-w-0 ${isPreviewMaximized ? 'hidden' : ''}`}>
                    <div className="flex border-b border-gray-600">
                        <InputTabButton tabName="html">{'</> HTML → JSON 변환'}</InputTabButton>
                        <InputTabButton tabName="json">{`{} JSON 데이터 보기`}</InputTabButton>
                        <InputTabButton tabName="image">{`🖼️ 이미지로 JSON 생성`}</InputTabButton>
                    </div>
                    <div className="flex-grow mt-[-1px]">
                        {activeInputTab === 'html' && (
                           <CodeInput
                                id="html-for-conversion-input"
                                label="JSON으로 변환할 HTML 입력"
                                value={htmlForJsonConversion}
                                onChange={setHtmlForJsonConversion}
                                hasError={!!error && activeInputTab === 'html'}
                                placeholder="Paste your page HTML here to convert to JSON..."
                            />
                        )}
                        {activeInputTab === 'json' && (
                             <CodeInput
                                id="json-input"
                                label="상세페이지 JSON 데이터"
                                value={jsonInput}
                                onChange={setJsonInput}
                                hasError={!!jsonError}
                                placeholder="Your page's JSON data will appear here after converting HTML or generating from an image."
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

                <div className={`flex flex-col items-center justify-center space-y-4 ${isPreviewMaximized ? 'hidden' : ''}`}>
                    <button
                        onClick={handleGenerateJsonFromHtml}
                        disabled={isConverting || activeInputTab !== 'html'}
                        className="w-48 h-12 flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg"
                    >
                        {isConverting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '▶ JSON으로 변환하기'}
                    </button>
                    <button
                        onClick={handleUndo}
                        disabled={previousPagePlan === null}
                        className="w-48 h-12 flex items-center justify-center bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg"
                    >
                        ⏪ 되돌리기
                    </button>
                    <button
                        onClick={handleGetFeedback}
                        disabled={isFeedbackLoading || !previewHtml}
                        className="w-48 h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-wait text-white font-bold rounded-lg shadow-lg"
                    >
                        {isFeedbackLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : '🤖 AI 마케팅 피드백'}
                    </button>
                    {error && <div className="text-red-400 text-xs text-center max-w-xs">{error}</div>}
                    {jsonError && <div className="text-red-400 text-xs text-center max-w-xs">{jsonError}</div>}
                </div>

                <div className="flex flex-col h-full min-w-0">
                    <div className="flex border-b border-gray-600 items-center">
                        <BuilderTabButton tabName="preview">Preview</BuilderTabButton>
                        <BuilderTabButton tabName="feedback">AI 피드백</BuilderTabButton>
                        <BuilderTabButton tabName="notes">내 피드백</BuilderTabButton>
                         <div className="ml-auto flex items-center pr-4 gap-4">
                            <button
                                onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                                className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                title={isPreviewMaximized ? "편집기 보기" : "전체 화면으로 보기"}
                            >
                                {isPreviewMaximized ? <MinimizeIcon /> : <MaximizeIcon />}
                            </button>
                             <label htmlFor="feedback-mode-toggle" className="flex items-center cursor-pointer">
                                <span className="mr-3 text-sm font-medium text-gray-300">요소 피드백</span>
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        id="feedback-mode-toggle" 
                                        className="sr-only peer" 
                                        checked={isFeedbackModeEnabled}
                                        onChange={() => setIsFeedbackModeEnabled(!isFeedbackModeEnabled)} 
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
                            isFeedbackModeEnabled={isFeedbackModeEnabled}
                            onElementFeedback={(feedback) => {
                                setUserNotes(prev => `${prev}\n${feedback}`.trim());
                                setActiveBuilderTab('notes');
                            }}
                            onImageFeedback={(src) => {
                                setEditingGeneratedImage(null); // Ensure only one edit mode is active
                                setEditingImage({ visible: true, src: src });
                            }}
                            onImageClick={(src) => {
                                setFullScreenImageSrc(src);
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
        </div>
    );
}