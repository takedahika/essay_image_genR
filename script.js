document.addEventListener('DOMContentLoaded', () => {
    const animationContainer = document.getElementById('page-load-animation');
    const animatedHeading = document.getElementById('animated-heading');
    const mainAppContainer = document.getElementById('main-app-container');

    if (animationContainer && animatedHeading && mainAppContainer) {
        animatedHeading.innerHTML = ''; // Clear original text or any pre-existing content

        const textLines = [
            "言葉をさらに広げるための",
            "画像メーカー"
        ];

        textLines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
                animatedHeading.appendChild(document.createElement('br'));
            }
            const chars = line.split('');
            chars.forEach((char) => {
                const span = document.createElement('span');
                span.className = 'anim-char';
                if (char === ' ') {
                    // Use a non-breaking space or ensure CSS handles spaces correctly for inline-block
                    span.innerHTML = ' ';
                } else {
                    span.textContent = char;
                }
                animatedHeading.appendChild(span);
            });
        });

        const charSpans = animatedHeading.querySelectorAll('.anim-char');
        const charRevealDelay = 80; // ms per character for reveal
        const animationFadeOutDelay = 700; // ms after last char for fade out to start
        const contentFadeInDelay = 100; // ms after animation fades for content to start fading in
        const animationContainerFadeOutDuration = 500; // Corresponds to CSS transition duration
        const mainAppFadeInDuration = 500; // Corresponds to CSS transition duration


        charSpans.forEach((span, index) => {
            setTimeout(() => {
                span.classList.add('visible');
            }, index * charRevealDelay);
        });

        // Calculate total animation time based on the number of actual characters to animate
        const totalCharAnimationTime = charSpans.length * charRevealDelay;
        // Time until animation container starts to fade out
        const timeToStartFadeOut = totalCharAnimationTime + animationFadeOutDelay;

        setTimeout(() => {
            animationContainer.style.opacity = '0';
            animationContainer.addEventListener('transitionend', () => {
                animationContainer.style.display = 'none';
            }, { once: true });

            // Make main app container ready to be shown
            mainAppContainer.style.display = 'block'; 
            
            setTimeout(() => {
                mainAppContainer.style.opacity = '1';
                initializeApp(); // Initialize the main app logic
            }, contentFadeInDelay);

        }, timeToStartFadeOut);
    } else {
        // Fallback if animation elements are not found, run app directly
        console.warn("Animation elements not found. Initializing app directly.");
        if(mainAppContainer) {
            mainAppContainer.style.display = 'block';
            mainAppContainer.style.opacity = '1';
        }
        initializeApp();
    }
});

function initializeApp() {
    console.log("DOM Content Loaded - Script Execution Started V2.6.6");

    // DOM要素取得
    const essayTitleInput = document.getElementById('essay-title');
    const essayTextInput = document.getElementById('essay-text');
    const authorNameInput = document.getElementById('author-name');
    const snsAccountInput = document.getElementById('sns-account');
    const snsTypeSelect = document.getElementById('sns-type'); // 隠しselect
    const insertPageBreakButton = document.getElementById('insert-page-break-button');
    const generatePreviewButton = document.getElementById('generate-preview-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const previewSection = document.querySelector('.preview-section');
    const previewArea = document.getElementById('preview-area');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const snsButtons = document.querySelectorAll('.sns-btn'); // 表示用ボタン
    const toggleAdvancedSettingsButton = document.getElementById('toggle-advanced-settings-button');
    const advancedSettingsPanel = document.getElementById('advanced-settings-panel');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const textColorPicker = document.getElementById('text-color-picker');
    const bgColorCodeInput = document.getElementById('bg-color-code');
    const textColorCodeInput = document.getElementById('text-color-code');
    const fontFamilySelect = document.getElementById('font-family-select');
    const profileImageUpload = document.getElementById('profile-image-upload');
    const profileImagePreview = document.getElementById('profile-image-preview');

    const PAGE_BREAK_MARKER = '【ページ区切り】';
    let generatedPagesData = []; // { type, title, text, pageNum, totalPages, author, sns, profileImage, imageDataUrl }
    let userProfileImageBase64 = null;

    const SNS_CONFIGS = {
        twitter_vertical: { width: 1080, height: 1350, baseFontSize: 34, name: "Twitter Vertical (4:5)" },
        instagram_feed: { width: 1080, height: 1350, baseFontSize: 34, name: "Instagram Feed (4:5)" },
        instagram_story: { width: 1080, height: 1920, baseFontSize: 38, name: "Instagram Story (9:16)" },
        square: { width: 1080, height: 1080, baseFontSize: 34, name: "Square (1:1)" }
    };

    const COMMON_IMAGE_STYLES = {
        fontFamily: "'Noto Serif JP', serif", // 初期値, currentFontFamilyで上書き
        lineHeight: '1.8',
        padding: '100px',
        backgroundColor: '#fdfbf7', // 初期値, currentBackgroundColorで上書き
        textColor: '#383838', // 初期値, currentTextColorで上書き
        pageNumberFontSize: '22px',
        titleFontSizeMultiplier: 1.3,
        titleBottomMargin: '30px',
        finalInfoBaseFontSize: 28,
        finalAuthorNameMultiplier: 1.25,
        finalSnsAccountMultiplier: 1.0,
        finalSnsAccountOpacity: 0.8,
        finalPagePadding: '120px',
        profileImageSize: 256
    };

    let currentBackgroundColor = bgColorPicker.value;
    let currentTextColor = textColorPicker.value;
    let currentFontFamily = fontFamilySelect.value;
    let currentSelectedSnsKey = snsTypeSelect.options.length > 0 ? snsTypeSelect.options[0].value : Object.keys(SNS_CONFIGS)[0];
    snsTypeSelect.value = currentSelectedSnsKey;

    snsButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sns === currentSelectedSnsKey);
    });
    if (bgColorCodeInput) bgColorCodeInput.value = currentBackgroundColor;
    if (textColorCodeInput) textColorCodeInput.value = currentTextColor;

    insertPageBreakButton.addEventListener('click', () => {
        const cursorPos = essayTextInput.selectionStart;
        const text = essayTextInput.value;
        const newText = text.substring(0, cursorPos) + PAGE_BREAK_MARKER + text.substring(essayTextInput.selectionEnd);
        essayTextInput.value = newText;
        essayTextInput.focus();
        essayTextInput.setSelectionRange(cursorPos + PAGE_BREAK_MARKER.length, cursorPos + PAGE_BREAK_MARKER.length);
    });

    snsButtons.forEach(button => {
        button.addEventListener('click', () => {
            snsButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentSelectedSnsKey = button.dataset.sns;
            snsTypeSelect.value = currentSelectedSnsKey;
        });
    });

    toggleAdvancedSettingsButton.addEventListener('click', () => {
        const isOpen = advancedSettingsPanel.style.display === 'block';
        advancedSettingsPanel.style.display = isOpen ? 'none' : 'block';
        toggleAdvancedSettingsButton.classList.toggle('open', !isOpen);
        toggleAdvancedSettingsButton.querySelector('.toggle-icon').textContent = isOpen ? '▶' : '▼';
    });

    bgColorPicker.addEventListener('input', (event) => {
        currentBackgroundColor = event.target.value;
        if (bgColorCodeInput) bgColorCodeInput.value = currentBackgroundColor;
    });
    if (bgColorCodeInput) {
        bgColorCodeInput.addEventListener('input', (event) => {
            const value = event.target.value.trim();
            if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(value) || /^#([0-9A-Fa-f]{6}){1,2}$/.test(value)) {
                currentBackgroundColor = value;
                bgColorPicker.value = value;
                event.target.style.borderColor = '';
            } else {
                event.target.style.borderColor = 'red';
            }
        });
    }

    textColorPicker.addEventListener('input', (event) => {
        currentTextColor = event.target.value;
        if (textColorCodeInput) textColorCodeInput.value = currentTextColor;
    });
    if (textColorCodeInput) {
        textColorCodeInput.addEventListener('input', (event) => {
            const value = event.target.value.trim();
             if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(value) || /^#([0-9A-Fa-f]{6}){1,2}$/.test(value)) {
                currentTextColor = value;
                textColorPicker.value = value;
                event.target.style.borderColor = '';
            } else {
                event.target.style.borderColor = 'red';
            }
        });
    }

    fontFamilySelect.addEventListener('change', (event) => {
        currentFontFamily = event.target.value;
    });

    profileImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                userProfileImageBase64 = e.target.result;
                profileImagePreview.src = userProfileImageBase64;
                profileImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            userProfileImageBase64 = null;
            profileImagePreview.style.display = 'none';
        }
    });

    function getSelectedSnsConfig() {
        if (currentSelectedSnsKey && SNS_CONFIGS[currentSelectedSnsKey]) {
            return SNS_CONFIGS[currentSelectedSnsKey];
        }
        showError(`有効なSNSタイプが選択されていません。キー: '${currentSelectedSnsKey}'`);
        return null;
    }

    generatePreviewButton.addEventListener('click', async () => {
        const config = getSelectedSnsConfig();
        if (!config) return;

        const essayTitle = essayTitleInput.value.trim();
        const essayText = essayTextInput.value;
        const authorName = authorNameInput.value.trim();
        const snsAccount = snsAccountInput.value.trim();

        if (!essayText.trim() && !essayTitle.trim()) {
            showError('タイトルまたはエッセイ本文を入力してください。');
            return;
        }

        showLoading(true);
        previewArea.innerHTML = '';
        generatedPagesData = [];

        const renderer = createRendererDiv();
        const textPages = splitTextIntoPagesByMarker(essayText, essayTitle, config, renderer);
        if (renderer.parentNode) renderer.parentNode.removeChild(renderer);

        const essayPagesData = [];
        const totalEssayPages = textPages.length;
        for (let i = 0; i < totalEssayPages; i++) {
            const pageText = textPages[i];
            essayPagesData.push({ type: 'essay', title: essayTitle, text: pageText, pageNum: i + 1, totalPages: totalEssayPages });
        }
        const finalPageData = { type: 'final', author: authorName, sns: snsAccount, profileImage: userProfileImageBase64 };
        
        generatedPagesData = [...essayPagesData, finalPageData];

        const imageGenerationPromises = generatedPagesData.map((pData, idx) =>
            addGeneratedImageToDisplay(pData, config, idx)
        );
        
        try {
            await Promise.all(imageGenerationPromises);
            previewSection.style.display = 'block';
        } catch (error) {
            console.error("Error during image generation for display:", error);
            // showError is called within addGeneratedImageToDisplay for individual errors
        } finally {
            showLoading(false);
        }
    });

    downloadZipButton.addEventListener('click', async () => {
        const config = getSelectedSnsConfig();
        if (!config) return;
        if (generatedPagesData.length === 0) {
            showError('まず画像を生成してください。');
            return;
        }
        showLoading(true);
        const zip = new JSZip();
        try {
            for (let i = 0; i < generatedPagesData.length; i++) {
                const pageInfo = generatedPagesData[i];
                let imageDataUrl = pageInfo.imageDataUrl;

                if (!imageDataUrl) { // Should not happen if preview was generated, but as a fallback
                    console.warn(`ImageDataUrl not found for page ${i + 1}, regenerating...`);
                    const imageContainer = createActualImageContainer(pageInfo, config, pageInfo.type === 'essay' ? pageInfo.pageNum : generatedPagesData.filter(p => p.type === 'essay').length + 1);
                    const canvas = await html2canvas(imageContainer, {
                        scale: 2, useCORS: true, backgroundColor: currentBackgroundColor,
                        width: config.width, height: config.height,
                        windowWidth: config.width, windowHeight: config.height, logging: false
                    });
                    imageDataUrl = canvas.toDataURL('image/png');
                    if (imageContainer.parentNode) imageContainer.parentNode.removeChild(imageContainer);
                }
                
                const fileName = pageInfo.type === 'essay'
                    ? `page_${String(pageInfo.pageNum).padStart(2, '0')}.png`
                    : 'final_page.png';
                zip.file(fileName, imageDataUrl.split(',')[1], { base64: true });
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `${currentSelectedSnsKey}_essay_images.zip`);
        } catch (err) {
            console.error('ZIP生成エラー:', err);
            showError('画像の生成またはZIP化中にエラーが発生しました。');
        } finally {
            showLoading(false);
        }
    });

    function splitTextIntoPagesByMarker(text, essayTitle, config, renderer) {
        const rawPages = text.split(PAGE_BREAK_MARKER);
        const finalPages = [];

        renderer.style.fontFamily = currentFontFamily;
        renderer.style.lineHeight = COMMON_IMAGE_STYLES.lineHeight;
        renderer.style.whiteSpace = 'pre-wrap';
        renderer.style.wordWrap = 'break-word';
        renderer.style.padding = '0';

        for (let pageIndex = 0; pageIndex < rawPages.length; pageIndex++) {
            const rawPageText = rawPages[pageIndex];
            let pageContentHeightMax = config.height - (parseInt(COMMON_IMAGE_STYLES.padding) * 2) - parseInt(COMMON_IMAGE_STYLES.pageNumberFontSize) - 20; // Approx page num height
            let actualTitleHeight = 0;

            if (essayTitle) {
                const tempTitleDiv = document.createElement('div');
                tempTitleDiv.style.fontFamily = currentFontFamily;
                tempTitleDiv.textContent = essayTitle;
                tempTitleDiv.style.fontSize = `${Math.round(config.baseFontSize * COMMON_IMAGE_STYLES.titleFontSizeMultiplier)}px`;
                tempTitleDiv.style.fontWeight = 'bold';
                tempTitleDiv.style.marginBottom = COMMON_IMAGE_STYLES.titleBottomMargin;
                tempTitleDiv.style.textAlign = 'center';
                tempTitleDiv.style.width = `${config.width - (parseInt(COMMON_IMAGE_STYLES.padding) * 2)}px`;
                renderer.innerHTML = '';
                renderer.appendChild(tempTitleDiv);
                actualTitleHeight = renderer.offsetHeight;
                pageContentHeightMax -= actualTitleHeight;
            }
            
            renderer.style.width = `${config.width - (parseInt(COMMON_IMAGE_STYLES.padding) * 2)}px`;
            renderer.style.fontSize = `${config.baseFontSize}px`;

            if (rawPageText.trim() === '') {
                finalPages.push('');
                continue;
            }
            
            renderer.innerHTML = ''; 
            renderer.style.width = `${config.width - (parseInt(COMMON_IMAGE_STYLES.padding) * 2)}px`;
            renderer.style.fontSize = `${config.baseFontSize}px`;

            renderer.textContent = rawPageText;
            if (renderer.offsetHeight <= pageContentHeightMax) {
                finalPages.push(rawPageText);
            } else {
                let currentChunk = '';
                let tempTextContainer = document.createElement('div');
                tempTextContainer.style.fontFamily = currentFontFamily;
                tempTextContainer.style.fontSize = `${config.baseFontSize}px`;
                tempTextContainer.style.lineHeight = COMMON_IMAGE_STYLES.lineHeight;
                tempTextContainer.style.whiteSpace = 'pre-wrap';
                tempTextContainer.style.wordWrap = 'break-word';
                renderer.innerHTML = ''; 
                renderer.appendChild(tempTextContainer);

                for (let i = 0; i < rawPageText.length; i++) {
                    tempTextContainer.textContent += rawPageText[i];
                    if (tempTextContainer.offsetHeight > pageContentHeightMax) {
                        const textToAdd = tempTextContainer.textContent.slice(0, -1);
                        if (textToAdd.trim() !== '' || finalPages.length === 0 || (finalPages.length > 0 && finalPages[finalPages.length -1].trim() !== '')) {
                             finalPages.push(textToAdd.trimEnd());
                        }
                        currentChunk = rawPageText[i];
                        tempTextContainer.textContent = currentChunk;
                    } else {
                        currentChunk = tempTextContainer.textContent;
                    }
                }
                if (currentChunk.trim() !== '') {
                    finalPages.push(currentChunk.trimEnd());
                } else if (finalPages.length > 0 && finalPages[finalPages.length -1].trim() === '' && rawPageText.trim() !== '') {
                    // Skip adding an empty page if the previous was also empty due to splitting
                } else if (finalPages.length === 0 && currentChunk.trim() === '') {
                     finalPages.push(''); 
                }
            }
        }
        if (finalPages.length === 0 && (essayTitle || text.trim() !== '')) { 
            finalPages.push('');
        }
        return finalPages;
    }

    function createRendererDiv() {
        const renderer = document.createElement('div');
        renderer.style.position = 'absolute';
        renderer.style.left = '-99999px';
        renderer.style.top = '-99999px';
        renderer.style.visibility = 'hidden'; 
        document.body.appendChild(renderer);
        return renderer;
    }

    async function addGeneratedImageToDisplay(pageData, config, pageIndexInArray) {
        const imageContainerForCanvas = createActualImageContainer(pageData, config, pageData.type === 'essay' ? pageData.pageNum : (generatedPagesData.filter(p => p.type === 'essay').length + 1) );

        try {
            const canvas = await html2canvas(imageContainerForCanvas, {
                scale: 2, 
                useCORS: true,
                backgroundColor: currentBackgroundColor, 
                width: config.width,
                height: config.height,
                windowWidth: config.width,
                windowHeight: config.height,
                logging: false
            });

            const imgDataUrl = canvas.toDataURL('image/png');
            
            generatedPagesData[pageIndexInArray].imageDataUrl = imgDataUrl;

            const previewImgWrapper = document.createElement('div');
            previewImgWrapper.classList.add('generated-image-wrapper');
            
            const displayWidth = 180; 
            previewImgWrapper.style.width = `${displayWidth}px`;
            previewImgWrapper.style.height = `${(config.height / config.width) * displayWidth}px`;
            previewImgWrapper.style.backgroundColor = currentBackgroundColor; 

            const imgElement = document.createElement('img');
            imgElement.src = imgDataUrl;
            imgElement.alt = pageData.type === 'essay' ? `Page ${pageData.pageNum}` : 'Final Page';

            previewImgWrapper.appendChild(imgElement);
            if (previewArea) previewArea.appendChild(previewImgWrapper);

        } catch (err) {
            console.error('Error generating image for display:', err);
            const errorPageIdentifier = pageData.type === 'essay' ? `ページ ${pageData.pageNum}` : '最終ページ';
            showError(`画像 (${errorPageIdentifier}) の表示準備中にエラー: ${err.message}`);
            throw err; 
        } finally {
            if (imageContainerForCanvas && imageContainerForCanvas.parentNode) {
                imageContainerForCanvas.parentNode.removeChild(imageContainerForCanvas);
            }
        }
    }

    function createActualImageContainer(pageInfo, config, currentPageNumForDisplay) { 
        const container = document.createElement('div');
        container.style.width = `${config.width}px`;
        container.style.height = `${config.height}px`;
        container.style.fontFamily = currentFontFamily;
        container.style.boxSizing = 'border-box';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.overflow = 'hidden'; 
        container.style.backgroundColor = currentBackgroundColor;
        container.style.color = currentTextColor;

        const contentArea = document.createElement('div');
        contentArea.style.whiteSpace = 'pre-wrap';
        contentArea.style.wordWrap = 'break-word';
        contentArea.style.flexGrow = '1';
        contentArea.style.overflow = 'hidden';
        contentArea.style.display = 'flex';
        contentArea.style.flexDirection = 'column';
        contentArea.style.fontFamily = currentFontFamily; 

        if (pageInfo.type === 'essay') {
            container.style.padding = COMMON_IMAGE_STYLES.padding;
            container.style.justifyContent = 'space-between'; 

            if (pageInfo.title) {
                const titleEl = document.createElement('div');
                titleEl.textContent = pageInfo.title;
                titleEl.style.fontSize = `${Math.round(config.baseFontSize * COMMON_IMAGE_STYLES.titleFontSizeMultiplier)}px`;
                titleEl.style.fontWeight = 'bold';
                titleEl.style.marginBottom = COMMON_IMAGE_STYLES.titleBottomMargin;
                titleEl.style.textAlign = 'center';
                titleEl.style.flexShrink = '0';
                titleEl.style.fontFamily = currentFontFamily;
                if (pageInfo.pageNum > 1) { 
                    titleEl.style.opacity = '0.4';
                }
                contentArea.appendChild(titleEl);
            }

            const textEl = document.createElement('div');
            textEl.textContent = pageInfo.text;
            textEl.style.fontSize = `${config.baseFontSize}px`;
            textEl.style.lineHeight = COMMON_IMAGE_STYLES.lineHeight;
            textEl.style.flexGrow = '1'; 
            textEl.style.overflow = 'hidden'; 
            textEl.style.fontFamily = currentFontFamily;
            contentArea.appendChild(textEl);
            
            container.appendChild(contentArea); 

            const pageNumberEl = document.createElement('div');
            pageNumberEl.style.textAlign = 'center';
            pageNumberEl.style.color = currentTextColor;
            pageNumberEl.style.opacity = 0.7;
            pageNumberEl.style.fontSize = COMMON_IMAGE_STYLES.pageNumberFontSize;
            pageNumberEl.style.paddingTop = '20px'; 
            pageNumberEl.style.flexShrink = '0'; 
            pageNumberEl.style.fontFamily = currentFontFamily; 
            pageNumberEl.textContent = `${pageInfo.pageNum} / ${pageInfo.totalPages}`;
            container.appendChild(pageNumberEl); 

        } else { // Final page
            container.style.padding = COMMON_IMAGE_STYLES.finalPagePadding;
            container.style.justifyContent = 'center'; 

            contentArea.style.justifyContent = 'center'; 
            contentArea.style.alignItems = 'center';
            contentArea.style.textAlign = 'center';
            contentArea.style.height = 'auto'; 
            contentArea.style.flexGrow = '0'; 

            if (pageInfo.profileImage) {
                const imgContainer = document.createElement('div');
                imgContainer.style.width = `${COMMON_IMAGE_STYLES.profileImageSize}px`;
                imgContainer.style.height = `${COMMON_IMAGE_STYLES.profileImageSize}px`;
                imgContainer.style.borderRadius = '50%';
                imgContainer.style.overflow = 'hidden';
                imgContainer.style.marginBottom = '20px'; 

                const imgEl = document.createElement('img');
                imgEl.src = pageInfo.profileImage;
                imgEl.style.display = 'block';
                imgEl.style.width = '100%';
                imgEl.style.height = '100%';
                imgEl.style.objectFit = 'cover';
                imgEl.style.objectPosition = 'center center';
                imgContainer.appendChild(imgEl);
                contentArea.appendChild(imgContainer);
            }

            const finalBaseSize = COMMON_IMAGE_STYLES.finalInfoBaseFontSize;
            let infoHtml = '';
            if (pageInfo.author) {
                infoHtml += `<div style="font-size: ${finalBaseSize * COMMON_IMAGE_STYLES.finalAuthorNameMultiplier}px; font-weight: bold; margin-bottom: ${finalBaseSize * 0.3}px; font-family: ${currentFontFamily};">${pageInfo.author}</div>`;
            }
            if (pageInfo.sns) {
                infoHtml += `<div style="font-size: ${finalBaseSize * COMMON_IMAGE_STYLES.finalSnsAccountMultiplier}px; opacity: ${COMMON_IMAGE_STYLES.finalSnsAccountOpacity}; font-family: ${currentFontFamily};">${pageInfo.sns}</div>`;
            }
            if (!pageInfo.author && !pageInfo.sns && !pageInfo.profileImage) {
                 infoHtml += `<div style="font-size: ${finalBaseSize * 1.2}px; opacity: 0.7; font-family: ${currentFontFamily};">Essay2Image</div>`;
            }
            contentArea.innerHTML += infoHtml; 

            container.appendChild(contentArea);
        }
        container.style.position = 'absolute';
        container.style.left = '-99999px'; 
        container.style.top = '-99999px';  
        document.body.appendChild(container);
        return container;
    }

    function showLoading(isLoading) {
        if (loadingMessage) loadingMessage.style.display = isLoading ? 'block' : 'none';
        if (generatePreviewButton) generatePreviewButton.disabled = isLoading;
        if (downloadZipButton) downloadZipButton.disabled = isLoading;
        if (isLoading && errorMessage) errorMessage.style.display = 'none';
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
}