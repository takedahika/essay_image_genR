document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Script Execution Started V2.6.5");

    // DOM要素取得
    const essayTitleInput = document.getElementById('essay-title');
    const essayTextInput = document.getElementById('essay-text');
    const authorNameInput = document.getElementById('author-name');
    const snsAccountInput = document.getElementById('sns-account');
    const snsTypeSelect = document.getElementById('sns-type'); // 隠しselect
    const insertPageBreakButton = document.getElementById('insert-page-break-button');
    const generatePreviewButton = document.getElementById('generate-preview-button');
    const downloadZipButton = document.getElementById('download-zip-button');
    const downloadIndividualButton = document.getElementById('download-individual-button');
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
    // donateLink はHTMLで直接リンクするため、JSでの取得とイベントリスナーは不要

    const PAGE_BREAK_MARKER = '【ページ区切り】';
    let generatedPagesData = [];
    let userProfileImageBase64 = null;

    const SNS_CONFIGS = {
        twitter_vertical: { width: 1080, height: 1350, baseFontSize: 34, name: "Twitter Vertical (4:5)" },
        instagram_feed: { width: 1080, height: 1350, baseFontSize: 34, name: "Instagram Feed (4:5)" },
        instagram_story: { width: 1080, height: 1920, baseFontSize: 38, name: "Instagram Story (9:16)" },
        square: { width: 1080, height: 1080, baseFontSize: 34, name: "Square (1:1)" }
    };

    const COMMON_IMAGE_STYLES = {
        fontFamily: "'Noto Serif JP', serif",
        lineHeight: '1.8',
        padding: '100px',
        backgroundColor: '#fdfbf7',
        textColor: '#383838',
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

    // 初期値設定
    let currentBackgroundColor = bgColorPicker.value;
    let currentTextColor = textColorPicker.value;
    let currentFontFamily = fontFamilySelect.value;
    let currentSelectedSnsKey = snsTypeSelect.options.length > 0 ? snsTypeSelect.options[0].value : Object.keys(SNS_CONFIGS)[0];
    snsTypeSelect.value = currentSelectedSnsKey; // select要素の初期値を設定

    // 初期アクティブボタン設定
    snsButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sns === currentSelectedSnsKey);
    });
    console.log("Initial SNS Key:", currentSelectedSnsKey);

    if (bgColorCodeInput) bgColorCodeInput.value = currentBackgroundColor;
    if (textColorCodeInput) textColorCodeInput.value = currentTextColor;


    // --- イベントリスナー設定 ---
    insertPageBreakButton.addEventListener('click', () => {
        console.log("Insert Page Break button clicked");
        const cursorPos = essayTextInput.selectionStart;
        const text = essayTextInput.value;
        const newText = text.substring(0, cursorPos) + PAGE_BREAK_MARKER + text.substring(essayTextInput.selectionEnd);
        essayTextInput.value = newText;
        essayTextInput.focus();
        essayTextInput.setSelectionRange(cursorPos + PAGE_BREAK_MARKER.length, cursorPos + PAGE_BREAK_MARKER.length);
    });

    snsButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log("SNS button clicked:", button.dataset.sns);
            snsButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentSelectedSnsKey = button.dataset.sns;
            snsTypeSelect.value = currentSelectedSnsKey; // 隠しselectも更新
        });
    });

    toggleAdvancedSettingsButton.addEventListener('click', () => {
        console.log("Toggle Advanced Settings button clicked");
        const isOpen = advancedSettingsPanel.style.display === 'block';
        advancedSettingsPanel.style.display = isOpen ? 'none' : 'block';
        toggleAdvancedSettingsButton.classList.toggle('open', !isOpen);
    });

    bgColorPicker.addEventListener('input', (event) => {
        currentBackgroundColor = event.target.value;
        if (bgColorCodeInput) bgColorCodeInput.value = currentBackgroundColor;
    });
    if (bgColorCodeInput) {
        bgColorCodeInput.addEventListener('input', (event) => {
            const value = event.target.value.trim();
            if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(value)) {
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
            if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(value)) {
                currentTextColor = value;
                textColorPicker.value = value;
                event.target.style.borderColor = '';
            } else {
                event.target.style.borderColor = 'red';
            }
        });
    }

    fontFamilySelect.addEventListener('change', (event) => {
        console.log("Font family changed to:", event.target.value);
        currentFontFamily = event.target.value;
    });

    profileImageUpload.addEventListener('change', (event) => {
        console.log("Profile image selected");
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
        console.log("getSelectedSnsConfig - currentSelectedSnsKey:", currentSelectedSnsKey);
        if (currentSelectedSnsKey && SNS_CONFIGS[currentSelectedSnsKey]) {
            return SNS_CONFIGS[currentSelectedSnsKey];
        }
        showError(`有効なSNSタイプが選択されていません。キー: '${currentSelectedSnsKey}'`);
        console.error("Error in getSelectedSnsConfig: Invalid key -", currentSelectedSnsKey, "Available keys:", Object.keys(SNS_CONFIGS));
        return null;
    }

    generatePreviewButton.addEventListener('click', async () => {
        console.log("Generate Preview button clicked");
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

        const totalEssayPages = textPages.length;
        for (let i = 0; i < totalEssayPages; i++) {
            const pageText = textPages[i];
            generatedPagesData.push({ type: 'essay', title: essayTitle, text: pageText, pageNum: i + 1, totalPages: totalEssayPages });
            addPageToPreview({ title: essayTitle, text: pageText, pageNum: i + 1, totalPages: totalEssayPages, isFinal: false, config: config });
        }

        generatedPagesData.push({ type: 'final', author: authorName, sns: snsAccount, profileImage: userProfileImageBase64 });
        addPageToPreview({ author: authorName, sns: snsAccount, profileImage: userProfileImageBase64, isFinal: true, config: config });

        previewSection.style.display = 'block';
        showLoading(false);
    });

    downloadZipButton.addEventListener('click', async () => {
        console.log("Download ZIP button clicked");
        const config = getSelectedSnsConfig();
        if (!config) return;
        if (generatedPagesData.length === 0) {
            showError('まずプレビューを生成してください。');
            return;
        }
        showLoading(true);
        const zip = new JSZip();
        try {
            for (let i = 0; i < generatedPagesData.length; i++) {
                const pageInfo = generatedPagesData[i];
                const imageContainer = createActualImageContainer(pageInfo, config, i + 1);
                const canvas = await html2canvas(imageContainer, {
                    scale: 2, useCORS: true, backgroundColor: null,
                    width: config.width, height: config.height,
                    windowWidth: config.width, windowHeight: config.height, logging: false
                });
                const fileName = pageInfo.type === 'essay'
                    ? `page_${String(pageInfo.pageNum).padStart(2, '0')}.png`
                    : 'final_page.png';
                zip.file(fileName, canvas.toDataURL('image/png').split(',')[1], { base64: true });
                if (imageContainer.parentNode) imageContainer.parentNode.removeChild(imageContainer);
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

    downloadIndividualButton.addEventListener('click', async () => {
        console.log("Download Individual button clicked");
        const config = getSelectedSnsConfig();
        if (!config) return;
        if (generatedPagesData.length === 0) {
            showError('まずプレビューを生成してください。');
            return;
        }
        showLoading(true);
        try {
            for (let i = 0; i < generatedPagesData.length; i++) {
                const pageInfo = generatedPagesData[i];
                const imageContainer = createActualImageContainer(pageInfo, config, i + 1);
                const canvas = await html2canvas(imageContainer, {
                    scale: 2, useCORS: true, backgroundColor: null,
                    width: config.width, height: config.height,
                    windowWidth: config.width, windowHeight: config.height, logging: false
                });
                const link = document.createElement('a');
                const fileName = pageInfo.type === 'essay'
                    ? `page_${String(pageInfo.pageNum).padStart(2, '0')}.png`
                    : 'final_page.png';
                link.download = fileName;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                if (imageContainer.parentNode) imageContainer.parentNode.removeChild(imageContainer);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (err) {
            console.error('個別画像生成エラー:', err);
            showError('個別画像の生成中にエラーが発生しました。');
        } finally {
            showLoading(false);
        }
    });

    // --- 主要関数 (V2.6.2から変更なし、ここにペースト) ---
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
            let pageContentHeightMax = config.height - (parseInt(COMMON_IMAGE_STYLES.padding) * 2) - parseInt(COMMON_IMAGE_STYLES.pageNumberFontSize) - 20;
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
            renderer.style.fontFamily = currentFontFamily;

            if (rawPageText.trim() === '') {
                finalPages.push('');
                continue;
            }
            
            renderer.innerHTML = ''; // 本文計測のためにクリア
            // renderer の幅とフォントサイズは上で設定済みなので、ここでは再設定不要かもしれないが、念のため
            renderer.style.width = `${config.width - (parseInt(COMMON_IMAGE_STYLES.padding) * 2)}px`;
            renderer.style.fontSize = `${config.baseFontSize}px`;

            renderer.textContent = rawPageText; // 本文のみで高さを計測
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
                    // Skip
                } else if (finalPages.length === 0 && currentChunk.trim() === '') {
                    finalPages.push('');
                }
            }
        }
        if (finalPages.length === 0 && essayTitle) {
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

    function addPageToPreview(pageData) {
        const { title, text, pageNum, totalPages, author, sns, profileImage, isFinal, config } = pageData;
        const previewContainer = document.createElement('div');
        previewContainer.classList.add('preview-image-container');
        const previewScale = 0.15;
        previewContainer.style.width = `${config.width * previewScale}px`;
        previewContainer.style.height = `${config.height * previewScale}px`;

        const contentArea = document.createElement('div');
        contentArea.classList.add('content-area-preview');
        contentArea.style.overflow = 'hidden';
        const basePreviewFontSize = Math.max(5, config.baseFontSize * previewScale * 0.9);
        contentArea.style.lineHeight = COMMON_IMAGE_STYLES.lineHeight;
        contentArea.style.fontFamily = currentFontFamily;

        previewContainer.style.backgroundColor = currentBackgroundColor;
        previewContainer.style.color = currentTextColor;

        if (!isFinal) {
            const previewPadding = Math.max(6, parseInt(COMMON_IMAGE_STYLES.padding) * previewScale * 0.8);
            contentArea.style.padding = `${previewPadding}px`;

            if (title) {
                const titleEl = document.createElement('div');
                titleEl.textContent = title;
                titleEl.style.fontSize = `${basePreviewFontSize * COMMON_IMAGE_STYLES.titleFontSizeMultiplier}px`;
                titleEl.style.fontWeight = 'bold';
                titleEl.style.marginBottom = `${Math.max(4,parseInt(COMMON_IMAGE_STYLES.titleBottomMargin) * previewScale * 0.5)}px`;
                titleEl.style.textAlign = 'center';
                if (pageNum > 1) {
                    titleEl.style.opacity = '0.4';
                }
                contentArea.appendChild(titleEl);
            }
            const textNode = document.createElement('div');
            textNode.textContent = text;
            textNode.style.fontSize = `${basePreviewFontSize}px`;
            contentArea.appendChild(textNode);

            const pageNumberEl = document.createElement('div');
            pageNumberEl.classList.add('page-number-preview');
            pageNumberEl.textContent = `${pageNum} / ${totalPages}`;
            pageNumberEl.style.fontSize = `${Math.max(5, parseInt(COMMON_IMAGE_STYLES.pageNumberFontSize) * previewScale * 0.9)}px`;
            pageNumberEl.style.color = currentTextColor;
            pageNumberEl.style.opacity = 0.7;
            pageNumberEl.style.padding = `${previewPadding * 0.15}px 0`;
            previewContainer.appendChild(contentArea);
            previewContainer.appendChild(pageNumberEl);
        } else {
            const finalPreviewPadding = Math.max(8, parseInt(COMMON_IMAGE_STYLES.finalPagePadding) * previewScale * 0.8);
            contentArea.style.padding = `${finalPreviewPadding}px`;
            contentArea.style.display = 'flex';
            contentArea.style.flexDirection = 'column';
            contentArea.style.justifyContent = 'center';
            contentArea.style.alignItems = 'center';
            contentArea.style.textAlign = 'center';

            previewContainer.classList.add('final-page-preview');
            const finalBaseSize = COMMON_IMAGE_STYLES.finalInfoBaseFontSize * previewScale * 0.9;

            if (profileImage) {
                const imgContainer = document.createElement('div');
                const previewProfileImgSize = COMMON_IMAGE_STYLES.profileImageSize * previewScale * 0.5;
                imgContainer.style.width = `${previewProfileImgSize}px`;
                imgContainer.style.height = `${previewProfileImgSize}px`;
                imgContainer.style.borderRadius = '50%';
                imgContainer.style.overflow = 'hidden';
                imgContainer.style.marginBottom = `${finalBaseSize * 0.2}px`;

                const imgEl = document.createElement('img');
                imgEl.src = profileImage;
                imgEl.style.display = 'block';
                imgEl.style.width = '100%';
                imgEl.style.height = '100%';
                imgEl.style.objectFit = 'cover';
                imgEl.style.objectPosition = 'center center';
                imgContainer.appendChild(imgEl);
                contentArea.appendChild(imgContainer);
            }

            let finalHtml = '';
            if (author) {
                finalHtml += `<div class="author-info-preview" style="font-size: ${finalBaseSize * COMMON_IMAGE_STYLES.finalAuthorNameMultiplier}px; font-weight: bold; margin-bottom: ${finalBaseSize * 0.3}px;">${author}</div>`;
            }
            if (sns) {
                finalHtml += `<div class="sns-info-preview" style="font-size: ${finalBaseSize * COMMON_IMAGE_STYLES.finalSnsAccountMultiplier}px; opacity: ${COMMON_IMAGE_STYLES.finalSnsAccountOpacity};">${sns}</div>`;
            }
            if (!author && !sns && !profileImage) {
                finalHtml = `<div style="font-size: ${finalBaseSize * 1.1}px; opacity: 0.7;">Essay2Image</div>`;
            }
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = finalHtml;
            Array.from(tempDiv.children).forEach(child => contentArea.appendChild(child));

            previewContainer.appendChild(contentArea);
        }
        if (previewArea) previewArea.appendChild(previewContainer);
    }

    function createActualImageContainer(pageInfo, config, currentPageNum) {
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
                if (currentPageNum > 1) {
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

            const pageNumberEl = document.createElement('div');
            pageNumberEl.style.textAlign = 'center';
            pageNumberEl.style.color = currentTextColor;
            pageNumberEl.style.opacity = 0.7;
            pageNumberEl.style.fontSize = COMMON_IMAGE_STYLES.pageNumberFontSize;
            pageNumberEl.style.paddingTop = '20px';
            pageNumberEl.style.flexShrink = '0';
            pageNumberEl.style.fontFamily = COMMON_IMAGE_STYLES.fontFamily;
            pageNumberEl.textContent = `${pageInfo.pageNum} / ${pageInfo.totalPages}`;

            container.appendChild(contentArea);
            container.appendChild(pageNumberEl);

        } else { // 最終ページ
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
            let authorHtml = '';
            if (pageInfo.author) {
                authorHtml = `<div style="font-size: ${finalBaseSize * COMMON_IMAGE_STYLES.finalAuthorNameMultiplier}px; font-weight: bold; margin-bottom: ${finalBaseSize * 0.3}px;">${pageInfo.author}</div>`;
            }
            let snsHtml = '';
            if (pageInfo.sns) {
                snsHtml = `<div style="font-size: ${finalBaseSize * COMMON_IMAGE_STYLES.finalSnsAccountMultiplier}px; opacity: ${COMMON_IMAGE_STYLES.finalSnsAccountOpacity};">${pageInfo.sns}</div>`;
            }
            if (!pageInfo.author && !pageInfo.sns && !pageInfo.profileImage) {
                 contentArea.innerHTML += `<div style="font-size: ${finalBaseSize * 1.2}px; opacity: 0.7;">Essay2Image</div>`;
            } else {
                 contentArea.innerHTML += authorHtml + snsHtml;
            }

            Array.from(contentArea.children).forEach(child => {
                if(child.tagName !== 'DIV' || !child.querySelector('img')) {
                    child.style.fontFamily = currentFontFamily;
                }
            });
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
        if (downloadIndividualButton) downloadIndividualButton.disabled = isLoading;
        if (isLoading && errorMessage) errorMessage.style.display = 'none';
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
});