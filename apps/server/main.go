package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	app := fiber.New(fiber.Config{
		AppName: "Kabootar Server",
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Adjust for production
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Health check for K8s readiness/liveness probes
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	api := app.Group("/api/v1")
	
	// Auth routes placeholder
	auth := api.Group("/auth")
	auth.Post("/login", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNotImplemented)
	})

	// Workspace routes placeholder
	workspaces := api.Group("/workspaces")
	workspaces.Get("/", func(c *fiber.Ctx) error {
		return c.JSON([]string{"Personal Workspace"})
	})

	// Sync routes placeholder
	sync := api.Group("/sync")
	sync.Post("/push", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNotImplemented)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting Kabootar server on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
