---
layout: splash
permalink: /
title: "Academic Homepage"
author_profile: false
redirect_from:
  - /about/
  - /about.html

intro_tagline: "I build trustworthy AI systems for scientific discovery and real-world impact."
intro_keywords:
  - Trustworthy AI
  - LLMs
  - Data-centric ML
  - Human-AI Collaboration
intro_affiliations:
  - "Principal Investigator (Incoming), Example AI Lab"
  - "Research Scientist, Example Institute"
  - "Affiliated Faculty, Department of Computer Science"
intro_actions:
  - label: "Download CV"
    url: "/cv/"
    class: "btn--primary"
  - label: "Email"
    url: "mailto:none@example.org"
    class: "btn--inverse"

feature_row_publications:
  - title: "Selected Publications"
    excerpt: "Curated papers on robust machine learning, evaluation protocols, and practical AI deployment."
    url: "/publications/"
    btn_label: "View Publications"
    btn_class: "btn--primary"

feature_row_news:
  - title: "Recent News"
    excerpt: "Latest updates on talks, awards, invited seminars, and group milestones."
    url: "/year-archive/"
    btn_label: "Read News"
    btn_class: "btn--inverse"

feature_row_projects:
  - title: "Open-source / Projects"
    excerpt: "Open-source tools, reproducible benchmarks, and ongoing collaborative projects."
    url: "/portfolio/"
    btn_label: "Explore Projects"
    btn_class: "btn--primary"
---

{% include feature_row id="feature_row_publications" type="left" %}
{% include feature_row id="feature_row_news" type="left" %}
{% include feature_row id="feature_row_projects" type="left" %}
