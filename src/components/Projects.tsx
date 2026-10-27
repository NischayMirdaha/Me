import { projects } from '../data';

export default function Projects() {
  return (
    <section id="work">
      <h2>Projects</h2>

      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.name}>
            <h3>{project.name}</h3>
            <p>{project.blurb}</p>

            <div className="project-tags">
              {project.stack.map((item) => (
                <span className="project-tag" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <a
              className="project-link"
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit project ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}