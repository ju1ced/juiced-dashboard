.PHONY: validate lint guards render test clean

## validate: run the SAME blocking checks as GitHub Actions CI
validate: lint guards render test
	@echo "OK: all local validation passed"

## lint: yaml + markdown linting (needs: pip install -r requirements-dev.txt, node)
lint:
	yamllint .
	npx --yes markdownlint-cli2 "**/*.md"

## guards: privacy + composition + mapping + resources
guards:
	python scripts/check_entity_refs.py
	python scripts/validate_compose.py
	python scripts/check_entities.py --mapping dashboard/templates/entities.example.yaml
	python scripts/check_resources.py

## render: placeholder-mapping render self-test
render:
	python scripts/render_dashboard.py --self-test

## test: pytest tool tests (positive + negative fixtures)
test:
	pytest -q

clean:
	rm -rf build .pytest_cache
