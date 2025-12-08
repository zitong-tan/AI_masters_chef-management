/**
 * 主题管理器
 * 负责管理全局主题颜色的应用和切换
 */

const THEMES = {
  blue: {
    primary: '#667eea',
    secondary: '#764ba2',
    primaryDark: '#1e3c72',
    secondaryDark: '#2a5298',
    accent: '#3498db',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  green: {
    primary: '#2ecc71',
    secondary: '#27ae60',
    primaryDark: '#27ae60',
    secondaryDark: '#229954',
    accent: '#27ae60',
    background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
  },
  purple: {
    primary: '#9b59b6',
    secondary: '#8e44ad',
    primaryDark: '#8e44ad',
    secondaryDark: '#7d3c98',
    accent: '#9b59b6',
    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)'
  },
  orange: {
    primary: '#f39c12',
    secondary: '#e67e22',
    primaryDark: '#e67e22',
    secondaryDark: '#d35400',
    accent: '#f39c12',
    background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
  }
};

class ThemeManager {
  constructor() {
    this.currentTheme = 'blue';
    this.init();
  }

  /**
   * 初始化主题
   */
  init() {
    // 从localStorage加载主题设置
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.currentTheme = settings.theme || 'blue';
      } catch (e) {
        console.warn('Failed to load theme settings:', e);
      }
    }
    
    // 应用主题
    this.applyTheme(this.currentTheme);
  }

  /**
   * 应用主题
   * @param {string} themeName - 主题名称
   */
  applyTheme(themeName) {
    if (!THEMES[themeName]) {
      console.warn(`Theme "${themeName}" not found, using default theme`);
      themeName = 'blue';
    }

    const root = document.documentElement;
    const theme = THEMES[themeName];
    
    // 移除所有主题类
    Object.keys(THEMES).forEach(name => {
      root.classList.remove(`theme-${name}`);
    });
    
    // 添加当前主题类
    root.classList.add(`theme-${themeName}`);
    
    // 设置CSS变量
    Object.keys(theme).forEach(key => {
      const cssVarName = this.camelToKebab(key);
      root.style.setProperty(`--theme-${cssVarName}`, theme[key]);
    });
    
    this.currentTheme = themeName;
    
    console.log(`Theme applied: ${themeName}`, theme);
  }

  /**
   * 获取当前主题
   * @returns {string} 当前主题名称
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * 获取所有可用主题
   * @returns {Object} 所有主题配置
   */
  getAvailableThemes() {
    return THEMES;
  }

  /**
   * 获取指定主题的颜色
   * @param {string} themeName - 主题名称
   * @param {string} colorKey - 颜色键名
   * @returns {string} 颜色值
   */
  getThemeColor(themeName, colorKey) {
    if (!THEMES[themeName] || !THEMES[themeName][colorKey]) {
      return THEMES.blue[colorKey] || '#000000';
    }
    return THEMES[themeName][colorKey];
  }

  /**
   * 驼峰转短横线命名
   * @param {string} str - 驼峰命名字符串
   * @returns {string} 短横线命名字符串
   */
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * 获取当前主题的CSS变量名映射
   * @returns {Object} CSS变量映射
   */
  getCurrentThemeCSS() {
    const theme = THEMES[this.currentTheme];
    const cssVars = {};
    
    Object.keys(theme).forEach(key => {
      const cssVarName = this.camelToKebab(key);
      cssVars[`--theme-${cssVarName}`] = theme[key];
    });
    
    return cssVars;
  }
}

// 创建全局主题管理器实例
const themeManager = new ThemeManager();

// 导出主题管理器
export default themeManager;

// 导出常用方法
export const applyTheme = (themeName) => themeManager.applyTheme(themeName);
export const getCurrentTheme = () => themeManager.getCurrentTheme();
export const getThemeColor = (themeName, colorKey) => themeManager.getThemeColor(themeName, colorKey);
export const getAvailableThemes = () => themeManager.getAvailableThemes();