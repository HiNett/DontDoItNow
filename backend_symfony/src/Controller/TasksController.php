<?php

namespace App\Controller;

use App\Entity\Tasks as TaskEntity;
use App\Repository\TasksRepository;
use App\Repository\UsersTasksRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class TasksController extends AbstractController
{
    #[Route('/tasks', name: 'app_tasks')]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/TasksController.php',
        ]);
    }

    #[Route('/api/tasks', name: 'tasks_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(UsersTasksRepository $usersTasksRepository): JsonResponse
    {
        try {
            $user = $this->getUser();
            
            if (!$user) {
                return $this->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            // Récupérer les tâches de l'utilisateur via le repository UsersTasks
            $tasks = $usersTasksRepository->findTasksByUser($user);

            $data = array_map(static function (TaskEntity $task): array {
                return [
                    'id' => $task->getId(),
                    'name' => $task->getName(),
                    'description' => $task->getDescription(),
                    'dueDate' => $task->getDueDate()?->format(DATE_ATOM),
                    'isArchived' => $task->isArchived(),
                ];
            }, $tasks);

            return $this->json($data);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la récupération des tâches',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }

    #[Route('/api/tasks/all', name: 'tasks_list_all', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listAll(TasksRepository $tasksRepository): JsonResponse
    {
        $tasks = $tasksRepository->findAll();

        $data = array_map(static function (TaskEntity $task): array {
            return [
                'id' => $task->getId(),
                'name' => $task->getName(),
                'description' => $task->getDescription(),
                'dueDate' => $task->getDueDate()?->format(DATE_ATOM),
                'isArchived' => $task->isArchived(),
            ];
        }, $tasks);

        return $this->json($data);
    }
}
