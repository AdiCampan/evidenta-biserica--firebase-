import React, { useState, useEffect, useRef } from 'react';
import { Table, Pagination, Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './PaginatedTable.scss';
import '../Button.scss';

/**
 * Componente de tabla con paginación y filtrado
 * @param {Array} data - Datos a mostrar en la tabla
 * @param {Array} columns - Configuración de columnas
 * @param {Function} onRowClick - Función a ejecutar al hacer clic en una fila
 * @param {Object} filters - Configuración de filtros
 * @param {Number} defaultPageSize - Tamaño de página por defecto
 * @param {Boolean} striped - Si la tabla debe tener filas alternadas
 * @param {Boolean} bordered - Si la tabla debe tener bordes
 * @param {Boolean} hover - Si la tabla debe resaltar filas al pasar el ratón
 * @param {String} size - Tamaño de la tabla (sm, md, lg)
 * @param {String} variant - Variante de estilo (light, dark)
 * @param {String} className - Clase CSS adicional
 */
const PaginatedTable = ({
  data = [],
  columns = [],
  onRowClick,
  filters = {},
  defaultPageSize = 10,
  striped = true,
  bordered = true,
  hover = true,
  size = 'sm',
  variant = 'light',
  className = '',
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  // Usar useRef para almacenar la versión anterior de los datos
  const prevDataRef = useRef();
  const prevFiltersRef = useRef();
  const prevSortConfigRef = useRef();

  // Aplicar filtros y ordenación a los datos
  useEffect(() => {
    // Verificar si los datos, filtros o configuración de ordenación han cambiado
    const dataChanged = prevDataRef.current !== data;
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    const sortConfigChanged = JSON.stringify(prevSortConfigRef.current) !== JSON.stringify(sortConfig);
    
    // Solo procesar si algo ha cambiado
    if (dataChanged || filtersChanged || sortConfigChanged) {
      let result = [...data];

      // Aplicar filtros activos
      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key].value) {
          const { value, type = 'text' } = filters[key];
          
          if (type === 'text') {
            result = result.filter((item) => {
              const fieldValue = item[key]?.toString().toLowerCase() || '';
              return fieldValue.includes(value.toLowerCase());
            });
          } else if (type === 'number') {
            result = result.filter((item) => {
              const fieldValue = parseFloat(item[key]);
              const filterValue = parseFloat(value);
              return !isNaN(fieldValue) && !isNaN(filterValue) && fieldValue === filterValue;
            });
          } else if (type === 'date') {
            // Implementar filtro de fecha si es necesario
          } else if (type === 'boolean') {
            result = result.filter((item) => item[key] === (value === 'true'));
          }
        }
      });

      // Aplicar ordenación
      if (sortConfig.key) {
        result.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      // Actualizar el estado solo si el resultado es diferente
      setFilteredData(result);
      
      // Actualizar las referencias
      prevDataRef.current = data;
      prevFiltersRef.current = filters;
      prevSortConfigRef.current = sortConfig;
    }
  }, [data, filters, sortConfig]);


  // Calcular páginas totales
  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  // Obtener datos de la página actual
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Manejar ordenación
  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  // Renderizar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Añadir primera página
    if (startPage > 1) {
      pages.push(
        <Pagination.Item
          key={1}
          active={1 === currentPage}
          onClick={() => handlePageChange(1)}
        >
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        pages.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }

    // Añadir páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Añadir última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      pages.push(
        <Pagination.Item
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.First
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {pages}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <div className={`paginated-table-container ${className}`}>
      <div className="table-controls mb-3">
        <Row>
          <Col xs={12} md={6} className="d-flex align-items-center mb-2 mb-md-0">
            <span className="me-2">{t('table.showing')}</span>
            <Form.Select
              size="sm"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="page-size-select me-2"
              style={{ width: 'auto' }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Form.Select>
            <span className="me-2">{t('table.entriesOf')}</span>
            <strong>{filteredData.length}</strong>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-md-end">
            <div className="table-info">
              {t('table.page')} {currentPage} {t('table.of')} {totalPages || 1}
            </div>
          </Col>
        </Row>
      </div>

      <div className="table-responsive">
        <Table
          striped={striped}
          bordered={bordered}
          hover={hover}
          size={size}
          variant={variant}
          className="modern-table"
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.sortable ? 'sortable-header' : ''}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="d-flex align-items-center">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="sort-icon ms-1">
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <i className="bi bi-caret-up-fill" />
                          ) : (
                            <i className="bi bi-caret-down-fill" />
                          )
                        ) : (
                          <i className="bi bi-arrow-down-up text-muted" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
            {/* Fila de filtros */}
            {Object.keys(filters).length > 0 && (
              <tr className="filter-row">
                {columns.map((column) => {
                  const filter = filters[column.key];
                  return (
                    <th key={`filter-${column.key}`} className="filter-cell">
                      {filter && filter.component ? (
                        <div className="filter-container">{filter.component}</div>
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map((column) => (
                    <td key={`${row.id || index}-${column.key}`}>
                      {column.render
                        ? column.render(row)
                        : row[column.key] !== undefined
                        ? row[column.key]
                        : ''}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  {t('table.noData')}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div className="table-info-bottom">
          {t('table.showing')} {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)} {t('table.to')}{' '}
          {Math.min(filteredData.length, currentPage * pageSize)} {t('table.of')} {filteredData.length} {t('table.entries')}
        </div>
        {renderPagination()}
      </div>
    </div>
  );
};

export default PaginatedTable;