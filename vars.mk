BEOL_REPO := dhlabbasel/beol

ifeq ($(BUILD_TAG),)
	BUILD_TAG := $(shell git describe --tag --dirty --abbrev=7)
endif
ifeq ($(BUILD_TAG),)
	BUILD_TAG := $(shell git rev-parse --verify HEAD)
endif

ifeq ($(BEOL_IMAGE),)
	BEOL_IMAGE := $(BEOL_REPO):$(BUILD_TAG)
endif
