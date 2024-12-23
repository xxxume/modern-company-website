/**
 * 联系表单处理脚本
 * 支持多种第三方留言接口：
 * 1. 自定义服务器API
 * 2. 第三方表单服务（如 FormSpree、Static Forms 等）
 * 3. 邮件服务（如 SendGrid、MailChimp 等）
 */

// 表单配置
const formConfig = {
    // 接口类型：'custom' | 'formspree' | 'staticforms' | 'sendgrid'
    type: 'custom',
    
    // 接口地址
    endpoint: '/api/contact',  // 根据实际接口地址修改
    
    // 接口凭证
    credentials: {
        // apiKey: 'your_api_key',  // API密钥（如需要）
        // projectId: 'your_project_id',  // 项目ID（如需要）
    },
    
    // 请求头设置
    headers: {
        'Content-Type': 'application/json'
        // 根据接口要求添加其他请求头
    }
};

// 表单处理类
class ContactForm {
    constructor(formId, config) {
        this.form = document.getElementById(formId);
        this.config = config;
        this.init();
    }

    init() {
        if (!this.form) return;
        
        // 生成表单令牌
        this.generateToken();
        
        // 绑定表单提交事件
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    // 生成表单令牌
    generateToken() {
        const timestamp = Date.now();
        const token = this.generateRandomString(32);
        
        document.getElementById('timestamp').value = timestamp;
        document.getElementById('formToken').value = token;
    }

    // 生成随机字符串
    generateRandomString(length) {
        return Array.from(crypto.getRandomValues(new Uint8Array(length)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // 处理表单提交
    async handleSubmit() {
        const form = this.form;
        const submitBtn = form.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        const formMessage = form.querySelector('.form-message');
        const successMessage = formMessage.querySelector('.success-message');
        const errorMessage = formMessage.querySelector('.error-message');

        try {
            // 显示加载状态
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-block';
            submitBtn.disabled = true;

            // 收集表单数据
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // 根据配置的接口类型处理提交
            let response;
            switch (this.config.type) {
                case 'custom':
                    response = await this.submitToCustomApi(data);
                    break;
                case 'formspree':
                    response = await this.submitToFormspree(data);
                    break;
                // 添加其他接口处理方法
                default:
                    throw new Error('未配置的接口类型');
            }

            // 显示成功消息
            formMessage.style.display = 'block';
            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            form.reset();

        } catch (error) {
            console.error('表单提交错误:', error);
            // 显示错误消息
            formMessage.style.display = 'block';
            successMessage.style.display = 'none';
            errorMessage.style.display = 'block';
        } finally {
            // 恢复按钮状态
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    // 提交到自定义API
    async submitToCustomApi(data) {
        const response = await fetch(this.config.endpoint, {
            method: 'POST',
            headers: this.config.headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        return response.json();
    }

    // 提交到 Formspree
    async submitToFormspree(data) {
        const response = await fetch(this.config.endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Formspree提交失败');
        }

        return response.json();
    }

    // 可以添加其他第三方服务的提交方法
}

// 初始化表单处理
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm('contactForm', formConfig);
}); 