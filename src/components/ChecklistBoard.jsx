import { useEffect, useMemo, useState } from 'react';
import { checklistData } from '../checklistData.js';
import {
  countDoneTopics,
  countTopics,
  getBlockTopicIds,
  getCompletionPercent,
  getTopicId,
  isBlockComplete,
  loadProgress,
  normalizeText,
  saveProgress,
} from '../utils/checklist.js';

const focusOptions = ['Todos', 'Máximo', 'Alto', 'Médio', 'Baixo'];

function Icon({ name, size = 17 }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  if (name === 'check') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.7 2.7L16 9" />
      </svg>
    );
  }

  if (name === 'circle') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }

  if (name === 'list') {
    return (
      <svg {...commonProps}>
        <path d="M8 6h12" />
        <path d="M8 12h12" />
        <path d="M8 18h12" />
        <path d="M4 6h.01" />
        <path d="M4 12h.01" />
        <path d="M4 18h.01" />
      </svg>
    );
  }

  if (name === 'book') {
    return (
      <svg {...commonProps}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M4 5.5v16" />
      </svg>
    );
  }

  if (name === 'reset') {
    return (
      <svg {...commonProps}>
        <path d="M4 7v5h5" />
        <path d="M20 12a8 8 0 0 0-14.9-4" />
        <path d="M20 17a8 8 0 0 1-14.9-4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia('(max-width: 720px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 720px)');
    const updateLayout = () => setIsMobile(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);

    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  return isMobile;
}

function TopicChecklist({ block, progress, onToggleTopic }) {
  return (
    <ul className="topic-checklist">
      {block.topics.map((topic) => {
        const topicId = getTopicId(block.id, topic);
        const isChecked = Boolean(progress[topicId]);

        return (
          <li className={isChecked ? 'checked-topic' : ''} key={topicId}>
            <label>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleTopic(block.id, topic)}
              />
              <span>{topic}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function DesktopRow({ block, progress, onToggleBlock, onToggleTopic }) {
  const isDone = isBlockComplete(block, progress);
  const doneTopics = getBlockTopicIds(block).filter((topicId) => progress[topicId]).length;

  return (
    <tr className={isDone ? 'done-row' : ''}>
      <td>
        <button
          className="check-button"
          type="button"
          onClick={() => onToggleBlock(block)}
          aria-label={isDone ? 'Desmarcar módulo' : 'Marcar módulo inteiro'}
          aria-pressed={isDone}
        >
          <Icon name={isDone ? 'check' : 'circle'} size={21} />
        </button>
      </td>
      <td>
        <span className="order-pill">{block.order}</span>
      </td>
      <td className="block-title">
        <strong>Bloco {block.order}</strong>
        <span>{block.title}</span>
        <small>
          {doneTopics}/{block.topics.length} assuntos
        </small>
      </td>
      <td>
        <TopicChecklist block={block} progress={progress} onToggleTopic={onToggleTopic} />
      </td>
      <td>
        <span className={`focus-pill ${normalizeText(block.focus)}`}>{block.focus}</span>
        <small className="probability">{block.probability}</small>
      </td>
      <td className="reason-cell">{block.reason}</td>
    </tr>
  );
}

function MobileCard({ block, progress, onToggleBlock, onToggleTopic }) {
  const isDone = isBlockComplete(block, progress);
  const doneTopics = getBlockTopicIds(block).filter((topicId) => progress[topicId]).length;

  return (
    <article className={`mobile-block-card ${isDone ? 'done-row' : ''}`}>
      <div className="mobile-block-head">
        <div>
          <p className="mobile-block-kicker">Bloco {block.order}</p>
          <h3>{block.title}</h3>
          <p className="mobile-block-meta">
            {doneTopics}/{block.topics.length} assuntos
          </p>
        </div>

        <button
          className="check-button"
          type="button"
          onClick={() => onToggleBlock(block)}
          aria-label={isDone ? 'Desmarcar módulo' : 'Marcar módulo inteiro'}
          aria-pressed={isDone}
        >
          <Icon name={isDone ? 'check' : 'circle'} size={21} />
        </button>
      </div>

      <div className="mobile-block-tags">
        <span className={`focus-pill ${normalizeText(block.focus)}`}>{block.focus}</span>
        <span className="probability">{block.probability}</span>
      </div>

      <p className="mobile-block-reason">{block.reason}</p>

      <TopicChecklist block={block} progress={progress} onToggleTopic={onToggleTopic} />
    </article>
  );
}

function ChecklistBoard() {
  const [activeSubject, setActiveSubject] = useState(checklistData[0].id);
  const [progress, setProgress] = useState(loadProgress);
  const [query, setQuery] = useState('');
  const [focusFilter, setFocusFilter] = useState('Todos');
  const isMobileLayout = useIsMobileLayout();

  const selectedSubject = useMemo(
    () => checklistData.find((item) => item.id === activeSubject) || checklistData[0],
    [activeSubject],
  );

  const allBlocks = useMemo(() => checklistData.flatMap((subject) => subject.blocks), []);

  const stats = useMemo(() => {
    const subjectDoneModules = selectedSubject.blocks.filter((block) =>
      isBlockComplete(block, progress),
    ).length;
    const subjectDoneTopics = countDoneTopics(selectedSubject.blocks, progress);
    const subjectTotalTopics = countTopics(selectedSubject.blocks);
    const totalDoneTopics = countDoneTopics(allBlocks, progress);
    const totalTopics = countTopics(allBlocks);

    return {
      subjectDoneModules,
      subjectTotalModules: selectedSubject.blocks.length,
      subjectDoneTopics,
      subjectTotalTopics,
      subjectPercent: getCompletionPercent(subjectDoneTopics, subjectTotalTopics),
      totalDoneTopics,
      totalTopics,
      totalPercent: getCompletionPercent(totalDoneTopics, totalTopics),
    };
  }, [allBlocks, progress, selectedSubject]);

  const filteredBlocks = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return selectedSubject.blocks.filter((block) => {
      const matchesFocus = focusFilter === 'Todos' || block.focus === focusFilter;
      const searchable = normalizeText(
        [block.title, block.focus, block.probability, block.reason, ...block.topics].join(' '),
      );
      const matchesSearch = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesFocus && matchesSearch;
    });
  }, [focusFilter, query, selectedSubject]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  function toggleTopic(blockId, topicTitle) {
    const topicId = getTopicId(blockId, topicTitle);

    setProgress((current) => ({
      ...current,
      [topicId]: !current[topicId],
    }));
  }

  function toggleBlock(block) {
    const topicIds = getBlockTopicIds(block);

    setProgress((current) => {
      const shouldComplete = !topicIds.every((topicId) => current[topicId]);
      const next = { ...current };

      topicIds.forEach((topicId) => {
        next[topicId] = shouldComplete;
      });

      return next;
    });
  }

  function resetProgress() {
    const shouldReset = window.confirm('Deseja limpar todas as marcações salvas?');

    if (shouldReset) {
      setProgress({});
    }
  }

  return (
    <main className="app-shell">
      <section className="board">
        <header className="app-header">
          <div className="brand-mark" aria-hidden="true">
            <img src="/escudoPM.png" alt="" />
          </div>
          <div>
            <p className="eyebrow">CheckListAPP</p>
            <h1>Checklist por dependência</h1>
            <p className="subtitle">
              Marque os assuntos estudados. O módulo fica completo automaticamente quando todos
              os assuntos dele forem concluídos.
            </p>
          </div>
        </header>

        <section className="summary-row" aria-label="Resumo do progresso">
          <div className="summary-card">
            <Icon name="list" size={17} />
            <span>
              {stats.subjectDoneModules}/{stats.subjectTotalModules}
            </span>
            <small>módulos em {selectedSubject.subject}</small>
          </div>
          <div className="summary-card">
            <Icon name="check" size={17} />
            <span>
              {stats.subjectDoneTopics}/{stats.subjectTotalTopics}
            </span>
            <small>assuntos da matéria</small>
          </div>
          <div className="summary-card">
            <Icon name="book" size={17} />
            <span>
              {stats.totalDoneTopics}/{stats.totalTopics}
            </span>
            <small>assuntos no total</small>
          </div>
        </section>

        <div
          className="progress-track"
          aria-label={`Progresso geral ${stats.totalPercent}%`}
          role="progressbar"
          aria-valuenow={stats.totalPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span style={{ width: `${stats.totalPercent}%` }} />
        </div>

        <section className="toolbar" aria-label="Filtros da tabela">
          <div className="subject-tabs" aria-label="Matérias">
            {checklistData.map((subject) => (
              <button
                className={subject.id === activeSubject ? 'active' : ''}
                key={subject.id}
                type="button"
                onClick={() => setActiveSubject(subject.id)}
                aria-pressed={subject.id === activeSubject}
              >
                {subject.subject}
              </button>
            ))}
          </div>

          <div className="tool-controls">
            <label className="search-box">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar assunto"
                aria-label="Buscar assunto"
              />
            </label>

            <select
              value={focusFilter}
              onChange={(event) => setFocusFilter(event.target.value)}
              aria-label="Filtrar por foco"
            >
              {focusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <button
              className="icon-button"
              type="button"
              onClick={resetProgress}
              title="Limpar marcações"
              aria-label="Limpar marcações"
            >
              <Icon name="reset" size={17} />
            </button>
          </div>
        </section>

        {isMobileLayout ? (
          <section className="mobile-cards-view" aria-label={`Blocos de ${selectedSubject.subject}`}>
            {filteredBlocks.map((block) => (
              <MobileCard
                key={block.id}
                block={block}
                progress={progress}
                onToggleBlock={toggleBlock}
                onToggleTopic={toggleTopic}
              />
            ))}

            {!filteredBlocks.length ? (
              <div className="empty-state">Nenhum módulo encontrado para esse filtro.</div>
            ) : null}
          </section>
        ) : (
          <section className="desktop-table-view" aria-label={`Tabela de ${selectedSubject.subject}`}>
            <table>
              <caption className="sr-only">
                Lista de blocos e assuntos da matéria {selectedSubject.subject}
              </caption>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Ordem</th>
                  <th>Módulo</th>
                  <th>Assuntos</th>
                  <th>Foco</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((block) => (
                  <DesktopRow
                    key={block.id}
                    block={block}
                    progress={progress}
                    onToggleBlock={toggleBlock}
                    onToggleTopic={toggleTopic}
                  />
                ))}
              </tbody>
            </table>

            {!filteredBlocks.length ? (
              <div className="empty-state">Nenhum módulo encontrado para esse filtro.</div>
            ) : null}
          </section>
        )}
      </section>
    </main>
  );
}

export default ChecklistBoard;
