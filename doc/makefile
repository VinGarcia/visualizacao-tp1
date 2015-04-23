# -----------------------------------------------------------------------------
# Config
SHELL = /bin/bash
OPEN = evince
# OPEN = $(shell hash acroread &> /dev/null && echo acroread || echo evince)

BIB = ref.bib
PDF = doc.pdf
TEX = doc.tex

# -----------------------------------------------------------------------------
# Compilation
.PHONY: open
open: $(PDF)
	@echo "-- Opening [$<]"
	@$(OPEN) $< &> /dev/null &

$(PDF): $(TEX) $(BIB)
	@echo "-- Compiling [$<]"
	@$(call ctex,$<)
	@#$(call cbib,$<)
	@$(call ctex,$<)
	@$(call ctex,$<)

# -----------------------------------------------------------------------------
# Commands

# pdflatex
CTEX = pdflatex --shell-escape
CTEX_ERR = "LaTeX Error\|l\.[0-9]\|error"

define ctex
	file=$(1); \
	echo "   running $(CTEX)..."; \
	err=$$(echo X | $(CTEX) "$${file}" &> .debug); \
	if [[ $$(grep -c $(CTEX_ERR) .debug) -ne 0 ]]; then \
		cat .debug; \
		rm -f $(1).pdf .debug; \
		rm -f *.log *.aux *.out *.dvi *.toc *.lof *.lot *.bbl *.blg; \
		exit 1; \
	fi; \
	exit 0;
endef

# bibtex
CBIB = bibtex
CBIB_ERR = "couldn\|Error\|error"

define cbib
	file=$(1:.tex=).aux; \
	echo "   running $(CBIB)..."; \
	$(CBIB) "$${file}" &> .debug; \
	if [[ $$(grep -c $(CBIB_ERR) .debug) -ne 0 ]]; then \
		cat .debug; \
		rm -f $(1:.tex=).pdf .debug; \
		rm -f *.log *.aux *.out *.dvi *.toc *.lof *.lot *.bbl *.blg; \
		exit 1; \
	fi; \
	exit 0;
endef

# ppopp-bibliography
# PPOPP_BIB_BEG = \
# 	"\begin{thebibliography}{}
# 	\softraggedright"
# PPOPP_BIB_BEG = "\end{thebibliography}"
# 
# define ppopp-bib
# 	file

.PHONY: clean
clean: $(TEX)
	@$(foreach file, $(^), rm -f "$(file:.tex=).pdf")
	@rm -f *.log *.aux *.out *.dvi *.toc *.lof *.lot *.bbl *.blg *.pyg
