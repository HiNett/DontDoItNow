<?php

namespace App\Controller;

use App\Entity\Tasks as TaskEntity;
use App\Repository\TasksRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

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
    public function list(TasksRepository $tasksRepository): JsonResponse
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
