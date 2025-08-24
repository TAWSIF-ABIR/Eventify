// Email Service Configuration
// Update these values with your EmailJS credentials

export const emailConfig = {
    // Your EmailJS Public Key
    publicKey: 'n_KnN0vv_3JWsFOOw',
    
    // Your Gmail Service ID
    serviceId: 'service_bmp4amu',
    
    // Your Event Registration Template ID
    templateId: 'template_supbavs',
    
    // Email service settings
    settings: {
        // Maximum retry attempts for failed emails
        maxRetries: 3,
        
        // Delay between retry attempts (in milliseconds)
        retryDelay: 1000,
        
        // Enable debug logging
        debug: true
    }
};

// Helper function to get all credentials
export function getEmailCredentials() {
    return {
        publicKey: emailConfig.publicKey,
        serviceId: emailConfig.serviceId,
        templateId: emailConfig.templateId
    };
}

// Helper function to validate credentials
export function validateEmailCredentials() {
    const { publicKey, serviceId, templateId } = emailConfig;
    
    if (!publicKey || !publicKey.startsWith('user_')) {
        return { valid: false, error: 'Invalid Public Key format' };
    }
    
    if (!serviceId || !serviceId.startsWith('service_')) {
        return { valid: false, error: 'Invalid Service ID format' };
    }
    
    if (!templateId || !templateId.startsWith('template_')) {
        return { valid: false, error: 'Invalid Template ID format' };
    }
    
    return { valid: true };
}
