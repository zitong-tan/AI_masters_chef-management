/**
 * 数据导出工具函数
 * 用于将数据导出为不同格式
 */

/**
 * 导出为JSON格式
 * @param {Object} data - 要导出的数据对象
 * @param {String} filename - 文件名（不含扩展名）
 * @returns {Boolean} 是否成功导出
 */
export function exportToJSON(data, filename = 'export') {
  try {
    // 验证数据
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data for JSON export');
    }

    // 转换为JSON字符串
    const jsonString = JSON.stringify(data, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 触发下载
    downloadFile(blob, `${filename}.json`);
    
    return true;
  } catch (error) {
    console.error('JSON export error:', error);
    return false;
  }
}

/**
 * 导出为CSV格式
 * @param {Array} data - 要导出的数据数组
 * @param {String} filename - 文件名（不含扩展名）
 * @param {Array} headers - 可选的表头数组
 * @returns {Boolean} 是否成功导出
 */
export function exportToCSV(data, filename = 'export', headers = null) {
  try {
    // 验证数据
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data for CSV export');
    }

    // 获取表头
    const csvHeaders = headers || Object.keys(data[0]);
    
    // 构建CSV内容
    const csvRows = [];
    
    // 添加表头行
    csvRows.push(csvHeaders.join(','));
    
    // 添加数据行
    data.forEach(row => {
      const values = csvHeaders.map(header => {
        const value = row[header];
        
        // 处理特殊字符和换行
        if (value === null || value === undefined) {
          return '';
        }
        
        const stringValue = String(value);
        
        // 如果包含逗号、引号或换行符，需要用引号包裹
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      });
      
      csvRows.push(values.join(','));
    });
    
    const csvString = csvRows.join('\n');
    
    // 添加BOM以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });
    
    // 触发下载
    downloadFile(blob, `${filename}.csv`);
    
    return true;
  } catch (error) {
    console.error('CSV export error:', error);
    return false;
  }
}

/**
 * 触发文件下载的辅助函数
 * @param {Blob} blob - 文件Blob对象
 * @param {String} filename - 文件名
 */
function downloadFile(blob, filename) {
  // 创建临时URL
  const url = window.URL.createObjectURL(blob);
  
  // 创建隐藏的a标签
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  // 添加到DOM并触发点击
  document.body.appendChild(link);
  link.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * 导出多个数据集为JSON
 * @param {Object} datasets - 包含多个数据集的对象
 * @param {String} filename - 文件名（不含扩展名）
 * @returns {Boolean} 是否成功导出
 */
export function exportMultipleDatasetsToJSON(datasets, filename = 'dashboard-export') {
  try {
    if (!datasets || typeof datasets !== 'object') {
      throw new Error('Invalid datasets for export');
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      data: datasets
    };

    return exportToJSON(exportData, filename);
  } catch (error) {
    console.error('Multiple datasets export error:', error);
    return false;
  }
}

/**
 * 将对象数组转换为CSV友好的格式
 * @param {Array} data - 原始数据数组
 * @param {Function} transformer - 可选的转换函数
 * @returns {Array} 转换后的数据数组
 */
export function prepareDataForCSV(data, transformer = null) {
  if (!Array.isArray(data)) {
    return [];
  }

  if (transformer && typeof transformer === 'function') {
    return data.map(transformer);
  }

  // 默认扁平化处理
  return data.map(item => {
    const flattened = {};
    
    Object.keys(item).forEach(key => {
      const value = item[key];
      
      // 将对象和数组转换为字符串
      if (typeof value === 'object' && value !== null) {
        flattened[key] = JSON.stringify(value);
      } else {
        flattened[key] = value;
      }
    });
    
    return flattened;
  });
}
